import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  Clock, 
  Users, 
  Settings,
  Code,
  Wrench
} from "lucide-react"

export function AcademyPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full mb-4">
          <Wrench className="h-8 w-8 text-orange-600 dark:text-orange-400" />
        </div>
        <h1 className="text-3xl font-bold">Academy</h1>
        <p className="text-muted-foreground mt-2">
          Educational content and courses to expand your knowledge
        </p>
        <Badge variant="secondary" className="mt-4 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
          Under Development
        </Badge>
      </div>

      {/* Feature Preview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Course Catalog</CardTitle>
            </div>
            <CardDescription>
              Browse and enroll in system-curated courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Financial literacy courses</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Investment strategies</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Personal finance management</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Progress Tracking</CardTitle>
            </div>
            <CardDescription>
              Monitor your learning progress and achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Course completion tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Learning time analytics</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Certification system</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Community Features</CardTitle>
            </div>
            <CardDescription>
              Connect with other learners and share knowledge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Discussion forums</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Study groups</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Expert Q&A sessions</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Development Status */}
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Code className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-lg">Development Status</CardTitle>
          </div>
          <CardDescription>
            Current progress on the Academy module
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center p-6 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
              <Settings className="h-12 w-12 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                System-Managed Courses Only
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300 max-w-md mx-auto">
                The Academy module is designed for system-curated educational content. 
                Users will be able to enroll in courses provided by the platform, but cannot create their own courses.
              </p>
            </div>
            
            <div className="grid gap-3 md:grid-cols-2 mt-6">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Course enrollment system</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Progress tracking</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Course content delivery</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Certification system</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}