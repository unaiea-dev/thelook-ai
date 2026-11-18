import Pricing from "@/components/Pricing";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: 'Preus - thelook',
}

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      <Header user={user} variant="pricing" />
      <main className="min-h-screen">
        <Pricing fullPage={true} />
      </main>
      <Footer />
    </>
  )
}
