import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, BookOpen } from "lucide-react";
import { COURSES, LEVEL_COLORS } from "@/data/courses";

export function CourseModules() {
  return (
    <section id="modules" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            The Curriculum
          </h2>
          <p className="text-muted-foreground text-lg">
            A structured progression from fundamentals to advanced execution — every module building on the last.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {COURSES.sort((a, b) => a.order - b.order).map((course, index) => {
            const Icon = course.icon;
            const levelStyle = LEVEL_COLORS[course.level];

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-card border-border overflow-hidden hover:border-primary/50 transition-all duration-300 group h-full">
                  {/* Gradient banner */}
                  <div
                    className="h-28 relative flex items-center justify-center"
                    style={{ background: course.gradient }}
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background: "rgba(201,168,76,0.12)",
                        border: "1px solid rgba(201,168,76,0.25)",
                      }}
                    >
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <div className="absolute top-3 left-4">
                      <span
                        className="text-xs font-bold tracking-widest"
                        style={{ color: "rgba(201,168,76,0.6)" }}
                      >
                        MODULE {String(course.order).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="absolute top-3 right-4">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded"
                        style={{
                          background: levelStyle.bg,
                          color: levelStyle.text,
                          border: `1px solid ${levelStyle.border}`,
                        }}
                      >
                        {course.level}
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm mb-5">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-5 text-xs text-muted-foreground border-t border-border pt-4">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-primary" />
                        {course.lessonsCount} lessons
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
