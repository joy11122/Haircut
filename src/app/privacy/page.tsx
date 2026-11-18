import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
  return <main className="container max-w-3xl py-16 sm:py-24">
    <Link href="/" className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#68745B]"><ArrowLeft size={13}/> Back to Haircut</Link>
    <span className="eyebrow mt-10 flex items-center gap-2"><ShieldCheck size={13}/> Privacy & image handling</span>
    <h1 className="display mt-4 text-[48px] leading-none">Your image. <i>Your choice.</i></h1>
    <div className="mt-8 space-y-7 text-[13px] leading-7 text-[#686B61]">
      <section><h2 className="text-[15px] font-semibold text-[#20231F]">Face-shape analysis</h2><p className="mt-2">Face-shape analysis runs in your browser. The original portrait is not uploaded for this analysis.</p></section>
      <section><h2 className="text-[15px] font-semibold text-[#20231F]">AI hairstyle generation</h2><p className="mt-2">AI generation is optional. Only after you accept the separate AI consent does the app send an optimized copy of your portrait to Replicate for processing by the configured image model. Generated previews are temporary at the AI provider and may expire.</p></section>
      <section><h2 className="text-[15px] font-semibold text-[#20231F]">Saving a generated look</h2><p className="mt-2">Saving is a separate action with a separate consent. The generated result image is copied to authenticated Cloudinary storage. The app serves the stored image through an account-ownership check, while its metadata is stored in the Haircut database under your account. Your original uploaded portrait is not saved by this feature.</p></section>
      <section><h2 className="text-[15px] font-semibold text-[#20231F]">Your control</h2><p className="mt-2">Your saved looks are private to your signed-in account. You can remove an individual saved look from your library; deletion removes its stored image as well as its database record.</p></section>
      <section><h2 className="text-[15px] font-semibold text-[#20231F]">Third-party providers</h2><p className="mt-2">Google is used for sign-in, Replicate for AI image generation, and Cloudinary for images you explicitly choose to save. Their own privacy and retention terms apply to data they process.</p></section>
    </div>
  </main>;
}
