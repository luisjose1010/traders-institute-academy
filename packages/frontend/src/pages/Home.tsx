import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TheEdge } from "@/components/landing/TheEdge";
import { CourseModules } from "@/components/landing/CourseModules";
import { SocialProof } from "@/components/landing/SocialProof";
import { EnrollmentPath } from "@/components/landing/EnrollmentPath";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground">
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <TheEdge />
        <CourseModules />
        <EnrollmentPath />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
