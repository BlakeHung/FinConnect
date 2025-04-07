'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

interface Member {
  id: string;
  name: string;
}

interface Settlement {
  from: Member;
  to: Member;
  amount: number;
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  amount: number;
}

type VisualizationType = 'force' | 'chord' | 'matrix' | 'stacked' | 'donut';

interface SettlementGraphProps {
  settlements: Settlement[];
  width?: number;
  height?: number;
}

export default function SettlementGraph({ settlements, width = 600, height = 400 }: SettlementGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [visualType, setVisualType] = useState<VisualizationType>('force');

  // 清理 SVG
  const clearSvg = () => {
    if (svgRef.current) {
      d3.select(svgRef.current).selectAll("*").remove();
    }
  };

  // 力導向圖
  const renderForceGraph = () => {
    if (!svgRef.current || settlements.length === 0) return;

    clearSvg();

    // 準備數據
    const uniqueMembers = new Map<string, Node>();
    
    // 收集所有唯一的成員
    settlements.forEach(s => {
      if (!uniqueMembers.has(s.from.id)) {
        uniqueMembers.set(s.from.id, {
          id: s.from.id,
          name: s.from.name,
        });
      }
      if (!uniqueMembers.has(s.to.id)) {
        uniqueMembers.set(s.to.id, {
          id: s.to.id,
          name: s.to.name,
        });
      }
    });

    const nodes: Node[] = Array.from(uniqueMembers.values());
    
    // 創建連結，使用實際的節點對象
    const links: Link[] = settlements.map(s => ({
      source: uniqueMembers.get(s.from.id)!,
      target: uniqueMembers.get(s.to.id)!,
      amount: s.amount
    }));

    // 計算最大和最小金額用於比例尺
    const maxAmount = Math.max(...links.map(l => l.amount));
    const minAmount = Math.min(...links.map(l => l.amount));

    // 創建比例尺
    const lineWidthScale = d3.scaleLinear()
      .domain([minAmount, maxAmount])
      .range([1, 5]);

    // 創建力導向模擬
    const simulation = d3.forceSimulation<Node>(nodes)
      .force("link", d3.forceLink<Node, Link>(links).id(d => d.id))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));

    // 創建 SVG 元素
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    // 添加箭頭定義
    svg.append("defs").selectAll("marker")
      .data(["end"])
      .join("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "#999")
      .attr("d", "M0,-5L10,0L0,5");

    // 創建連線
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => lineWidthScale(d.amount))
      .attr("marker-end", "url(#arrow)");

    // 創建節點
    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(drag(simulation));

    // 添加圓形背景
    node.append("circle")
      .attr("r", 20)
      .attr("fill", "#fff")
      .attr("stroke", "#333")
      .attr("stroke-width", 1.5);

    // 添加文字標籤
    node.append("text")
      .text(d => d.name)
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("font-size", "12px");

    // 添加金額標籤到連線
    const linkLabels = svg.append("g")
      .selectAll("text")
      .data(links)
      .join("text")
      .attr("font-size", "10px")
      .attr("text-anchor", "middle")
      .text(d => `$${d.amount.toFixed(2)}`);

    // 更新模擬
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as Node).x!)
        .attr("y1", d => (d.source as Node).y!)
        .attr("x2", d => (d.target as Node).x!)
        .attr("y2", d => (d.target as Node).y!);

      node
        .attr("transform", d => `translate(${d.x!},${d.y!})`);

      linkLabels
        .attr("x", d => ((d.source as Node).x! + (d.target as Node).x!) / 2)
        .attr("y", d => ((d.source as Node).y! + (d.target as Node).y!) / 2);
    });

    // 拖曳功能
    function drag(simulation: d3.Simulation<Node, undefined>) {
      function dragstarted(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3.drag<SVGGElement, Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    // 清理函數
    return () => {
      simulation.stop();
    };
  };

  // 環形圖
  const renderChordDiagram = () => {
    if (!svgRef.current || settlements.length === 0) return;

    clearSvg();

    const uniqueMembers = new Map<string, Node>();
    settlements.forEach(s => {
      if (!uniqueMembers.has(s.from.id)) {
        uniqueMembers.set(s.from.id, { id: s.from.id, name: s.from.name });
      }
      if (!uniqueMembers.has(s.to.id)) {
        uniqueMembers.set(s.to.id, { id: s.to.id, name: s.to.name });
      }
    });

    const nodes = Array.from(uniqueMembers.values());
    const matrix = Array(nodes.length).fill(0).map(() => Array(nodes.length).fill(0));

    // 建立矩陣數據
    settlements.forEach(s => {
      const sourceIndex = nodes.findIndex(n => n.id === s.from.id);
      const targetIndex = nodes.findIndex(n => n.id === s.to.id);
      matrix[sourceIndex][targetIndex] = s.amount;
    });

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const chord = d3.chord()
      .padAngle(0.05)
      .sortSubgroups(d3.descending)(matrix);

    const arc = d3.arc()
      .innerRadius(width * 0.2)
      .outerRadius(width * 0.25);

    const ribbon = d3.ribbon()
      .radius(width * 0.2);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // 繪製外圈
    const group = svg.append("g")
      .selectAll("g")
      .data(chord.groups)
      .join("g");

    group.append("path")
      .attr("fill", d => color(d.index))
      .attr("d", arc as any);

    // 添加標籤
    group.append("text")
      .each(d => {
        d.angle = (d.startAngle + d.endAngle) / 2;
      })
      .attr("dy", ".35em")
      .attr("transform", d => `
        rotate(${(d.angle * 180 / Math.PI - 90)})
        translate(${width * 0.27})
        ${d.angle > Math.PI ? "rotate(180)" : ""}
      `)
      .attr("text-anchor", d => d.angle > Math.PI ? "end" : "start")
      .text(d => nodes[d.index].name);

    // 繪製連接帶
    svg.append("g")
      .selectAll("path")
      .data(chord)
      .join("path")
      .attr("d", ribbon as any)
      .attr("fill", d => color(d.source.index))
      .attr("stroke", d => d3.rgb(color(d.source.index)).darker())
      .style("opacity", 0.7);
  };

  // 矩陣圖
  const renderMatrixDiagram = () => {
    if (!svgRef.current || settlements.length === 0) return;

    clearSvg();

    const uniqueMembers = new Map<string, Node>();
    settlements.forEach(s => {
      if (!uniqueMembers.has(s.from.id)) {
        uniqueMembers.set(s.from.id, { id: s.from.id, name: s.from.name });
      }
      if (!uniqueMembers.has(s.to.id)) {
        uniqueMembers.set(s.to.id, { id: s.to.id, name: s.to.name });
      }
    });

    const nodes = Array.from(uniqueMembers.values());
    const matrix = Array(nodes.length).fill(0).map(() => Array(nodes.length).fill(0));

    // 建立矩陣數據
    settlements.forEach(s => {
      const sourceIndex = nodes.findIndex(n => n.id === s.from.id);
      const targetIndex = nodes.findIndex(n => n.id === s.to.id);
      matrix[sourceIndex][targetIndex] = s.amount;
    });

    const margin = { top: 60, right: 60, bottom: 10, left: 60 };
    const size = Math.min(width, height) - margin.left - margin.right;
    const cellSize = size / nodes.length;

    const svg = d3.select(svgRef.current)
      .attr("width", size + margin.left + margin.right)
      .attr("height", size + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // 顏色比例尺
    const maxAmount = d3.max(matrix.flat()) || 0;
    const color = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, maxAmount]);

    // 繪製單元格
    const cells = svg.selectAll("g")
      .data(nodes)
      .join("g")
      .attr("transform", (d, i) => `translate(0,${i * cellSize})`);

    cells.selectAll("rect")
      .data((d, i) => matrix[i])
      .join("rect")
      .attr("x", (d, i) => i * cellSize)
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("fill", d => d > 0 ? color(d) : "#eee")
      .attr("stroke", "#fff");

    // 添加金額標籤
    cells.selectAll("text")
      .data((d, i) => matrix[i])
      .join("text")
      .attr("x", (d, i) => i * cellSize + cellSize / 2)
      .attr("y", cellSize / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .text(d => d > 0 ? `$${d}` : "");

    // 添加行標籤
    svg.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("x", -6)
      .attr("y", (d, i) => i * cellSize + cellSize / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .text(d => d.name);

    // 添加列標籤
    svg.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("x", (d, i) => i * cellSize + cellSize / 2)
      .attr("y", -6)
      .attr("transform", (d, i) => `rotate(-45,${i * cellSize + cellSize / 2},-6)`)
      .attr("text-anchor", "start")
      .text(d => d.name);
  };

  // 堆疊條形圖
  const renderStackedBarChart = () => {
    if (!svgRef.current || settlements.length === 0) return;

    clearSvg();

    const uniqueMembers = new Map<string, Node>();
    settlements.forEach(s => {
      if (!uniqueMembers.has(s.from.id)) {
        uniqueMembers.set(s.from.id, { id: s.from.id, name: s.from.name });
      }
      if (!uniqueMembers.has(s.to.id)) {
        uniqueMembers.set(s.to.id, { id: s.to.id, name: s.to.name });
      }
    });

    const nodes = Array.from(uniqueMembers.values());
    const memberBalances = nodes.map(member => {
      const owed = settlements
        .filter(s => s.from.id === member.id)
        .reduce((sum, s) => sum + s.amount, 0);
      const paid = settlements
        .filter(s => s.to.id === member.id)
        .reduce((sum, s) => sum + s.amount, 0);
      return {
        member,
        owed,
        paid,
        balance: paid - owed
      };
    });

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(memberBalances.map(d => d.member.name))
      .range([0, innerWidth])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(memberBalances, d => Math.max(d.owed, d.paid)) || 0])
      .range([innerHeight, 0]);

    // 繪製條形
    memberBalances.forEach((d, i) => {
      const barWidth = x.bandwidth();
      const barHeight = y(0) - y(d.owed);
      const barY = y(d.owed);

      // 應付金額（紅色）
      svg.append("rect")
        .attr("x", x(d.member.name) || 0)
        .attr("y", barY)
        .attr("width", barWidth)
        .attr("height", barHeight)
        .attr("fill", "#ff6b6b");

      // 已付金額（綠色）
      svg.append("rect")
        .attr("x", x(d.member.name) || 0)
        .attr("y", y(d.paid))
        .attr("width", barWidth)
        .attr("height", y(0) - y(d.paid))
        .attr("fill", "#4ecdc4");

      // 添加金額標籤
      svg.append("text")
        .attr("x", (x(d.member.name) || 0) + barWidth / 2)
        .attr("y", barY - 5)
        .attr("text-anchor", "middle")
        .text(`$${d.owed.toFixed(2)}`);

      svg.append("text")
        .attr("x", (x(d.member.name) || 0) + barWidth / 2)
        .attr("y", y(d.paid) - 5)
        .attr("text-anchor", "middle")
        .text(`$${d.paid.toFixed(2)}`);
    });

    // 添加軸線
    svg.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .call(d3.axisLeft(y));
  };

  // 圓環圖
  const renderDonutChart = () => {
    if (!svgRef.current || settlements.length === 0) return;

    clearSvg();

    const uniqueMembers = new Map<string, Node>();
    settlements.forEach(s => {
      if (!uniqueMembers.has(s.from.id)) {
        uniqueMembers.set(s.from.id, { id: s.from.id, name: s.from.name });
      }
      if (!uniqueMembers.has(s.to.id)) {
        uniqueMembers.set(s.to.id, { id: s.to.id, name: s.to.name });
      }
    });

    const nodes = Array.from(uniqueMembers.values());
    const memberBalances = nodes.map(member => {
      const owed = settlements
        .filter(s => s.from.id === member.id)
        .reduce((sum, s) => sum + s.amount, 0);
      const paid = settlements
        .filter(s => s.to.id === member.id)
        .reduce((sum, s) => sum + s.amount, 0);
      return {
        member,
        owed,
        paid,
        balance: paid - owed
      };
    });

    const radius = Math.min(width, height) / 2 * 0.8;
    const innerRadius = radius * 0.6;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width/2},${height/2})`);

    // 外圈（應付金額）
    const outerArc = d3.arc()
      .innerRadius(radius)
      .outerRadius(radius + 20);

    const outerPie = d3.pie()
      .value(d => d.owed)
      .sort(null);

    svg.append("g")
      .selectAll("path")
      .data(outerPie(memberBalances))
      .join("path")
      .attr("d", outerArc as any)
      .attr("fill", d => d3.interpolateCool(d.index / memberBalances.length))
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    // 內圈（已付金額）
    const innerArc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(innerRadius + 20);

    const innerPie = d3.pie()
      .value(d => d.paid)
      .sort(null);

    svg.append("g")
      .selectAll("path")
      .data(innerPie(memberBalances))
      .join("path")
      .attr("d", innerArc as any)
      .attr("fill", d => d3.interpolateCool(d.index / memberBalances.length))
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    // 添加標籤
    const labelArc = d3.arc()
      .innerRadius(radius + 30)
      .outerRadius(radius + 30);

    svg.append("g")
      .selectAll("text")
      .data(outerPie(memberBalances))
      .join("text")
      .attr("transform", d => `translate(${labelArc.centroid(d as any)})`)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(d => d.data.member.name);
  };

  useEffect(() => {
    switch (visualType) {
      case 'force':
        renderForceGraph();
        break;
      case 'chord':
        renderChordDiagram();
        break;
      case 'matrix':
        renderMatrixDiagram();
        break;
      case 'stacked':
        renderStackedBarChart();
        break;
      case 'donut':
        renderDonutChart();
        break;
    }
  }, [settlements, width, height, visualType]);

  return (
    <div className="relative w-full">
      <div className="mb-4 flex justify-end space-x-2">
        <button
          onClick={() => setVisualType('force')}
          className={`px-3 py-1 rounded ${
            visualType === 'force' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          力導向圖
        </button>
        <button
          onClick={() => setVisualType('chord')}
          className={`px-3 py-1 rounded ${
            visualType === 'chord' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          環形圖
        </button>
        <button
          onClick={() => setVisualType('matrix')}
          className={`px-3 py-1 rounded ${
            visualType === 'matrix' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          矩陣圖
        </button>
        <button
          onClick={() => setVisualType('stacked')}
          className={`px-3 py-1 rounded ${
            visualType === 'stacked' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          堆疊圖
        </button>
        <button
          onClick={() => setVisualType('donut')}
          className={`px-3 py-1 rounded ${
            visualType === 'donut' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          圓環圖
        </button>
      </div>
      <svg
        ref={svgRef}
        className="w-full border rounded-lg bg-white"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
} 