import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function TestPage() {
  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Shadcn UI 組件測試</CardTitle>
          <CardDescription>測試各種組件的樣式和功能</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 按鈕測試區 */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">按鈕變體</h3>
            <div className="flex gap-2 flex-wrap">
              <Button variant="default">Default</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          {/* 下拉選單測試區 */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">下拉選單</h3>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">選單測試</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>操作選項</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>新增記錄</DropdownMenuItem>
                  <DropdownMenuItem>編輯資料</DropdownMenuItem>
                  <DropdownMenuItem>查看報表</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    刪除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* 頭像測試區 */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">頭像樣式</h3>
            <div className="flex gap-4 items-center">
              <Avatar className="h-12 w-12">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar className="h-12 w-12">
                <AvatarImage src="/broken-image.jpg" />
                <AvatarFallback>測試</AvatarFallback>
              </Avatar>
              <Avatar className="h-12 w-12">
                <AvatarFallback>無圖</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* 卡片測試區 */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">卡片樣式</h3>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>小卡片</CardTitle>
                  <CardDescription>簡單的卡片示例</CardDescription>
                </CardHeader>
                <CardContent>
                  這是一個基本的卡片內容展示。
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>互動卡片</CardTitle>
                  <CardDescription>帶有按鈕的卡片</CardDescription>
                </CardHeader>
                <CardContent>
                  這張卡片展示了如何添加互動元素。
                </CardContent>
                <CardFooter>
                  <Button size="sm">了解更多</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            以上組件都正常顯示的話，代表 shadcn/ui 設置成功！
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}