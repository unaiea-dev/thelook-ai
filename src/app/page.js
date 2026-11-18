import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import Team from "@/components/Team";
import Footer from "@/components/Footer";
import BlogPreview from "@/components/blog/BlogPreview";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      <Header user={user} />
      <main>
        <Hero user={user} />
        <Features />
        <Pricing />
        <Team />
        <BlogPreview />
      </main>
      <Footer />
    </>
  );
}
