import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Play, Clock, Star } from "lucide-react"

export function AcademyPage() {
  const courses = [
    {
      id: 1,
      title: "Introduction to Personal Finance",
      description: "Learn the basics of managing your personal finances effectively.",
      duration: "2 hours",
      level: "Beginner",
      rating: 4.8,
      lessons: 12,
      image: "/placeholder-course.jpg"
    },
    {
      id: 2,
      title: "Investment Strategies",
      description: "Master different investment approaches and build a diversified portfolio.",
      duration: "4 hours",
      level: "Intermediate",
      rating: 4.9,
      lessons: 18,
      image: "/placeholder-course.jpg"
    },
    {
      id: 3,
      title: "Advanced Trading Techniques",
      description: "Learn advanced trading strategies and risk management techniques.",
      duration: "6 hours",
      level: "Advanced",
      rating: 4.7,
      lessons: 24,
      image: "/placeholder-course.jpg"
    },
  ]

  const stats = [
    { title: "Courses Completed", value: "12", icon: BookOpen },
    { title: "Hours Learned", value: "48", icon: Clock },
    { title: "Certificates Earned", value: "5", icon: Star },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Academy</h1>
        <p className="text-muted-foreground">
          Expand your knowledge with our comprehensive learning platform.
        </p>
      </div>

      {/* Learning Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Featured Courses */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Featured Courses</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant={
                    course.level === "Beginner" ? "secondary" :
                    course.level === "Intermediate" ? "default" : "destructive"
                  }>
                    {course.level}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{course.rating}</span>
                  </div>
                </div>
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div>{course.lessons} lessons</div>
                </div>
                <Button className="w-full">
                  <Play className="mr-2 h-4 w-4" />
                  Start Course
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Continue Learning */}
      <Card>
        <CardHeader>
          <CardTitle>Continue Learning</CardTitle>
          <CardDescription>
            Pick up where you left off.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Investment Strategies</p>
                <p className="text-sm text-muted-foreground">Lesson 8 of 18</p>
                <div className="w-48 bg-muted rounded-full h-2 mt-2">
                  <div className="bg-primary h-2 rounded-full w-1/2"></div>
                </div>
              </div>
            </div>
            <Button>Continue</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
