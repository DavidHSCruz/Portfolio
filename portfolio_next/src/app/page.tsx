import { Hero } from "@/components/hero-focus";
import { Services } from "@/components/services";
import { ProjectsShowcase } from "@/components/projects-showcase";
import { Process } from "@/components/process";
import { ContactCta } from "@/components/contact-cta";

export default function HomePage() {
  return <main><Hero /><Services /><ProjectsShowcase limit={5} /><Process /><ContactCta /></main>;
}
