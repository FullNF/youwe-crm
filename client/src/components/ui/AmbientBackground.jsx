/**
 * Soft, slow-moving colored glow blobs fixed behind all page content.
 * This is what makes glass surfaces (Sidebar, Topbar, Cards) actually look
 * glassy - blurring a flat color does nothing, blurring moving colored
 * light is what creates the effect. Kept subtle and slow so it reads as
 * ambient atmosphere, not a distraction.
 */
export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-base">
      <div className="absolute top-[-15%] left-[-8%] w-[40rem] h-[40rem] bg-accent/40 rounded-full blur-[110px] animate-float" />
      <div className="absolute top-[15%] right-[-12%] w-[36rem] h-[36rem] bg-info/35 rounded-full blur-[110px] animate-floatSlow" />
      <div className="absolute bottom-[-18%] left-[22%] w-[34rem] h-[34rem] bg-success/22 rounded-full blur-[110px] animate-float" />
      <div className="absolute bottom-[5%] right-[10%] w-[26rem] h-[26rem] bg-amber/20 rounded-full blur-[110px] animate-floatSlow" />
      <div className="absolute top-[45%] left-[40%] w-[22rem] h-[22rem] bg-danger/10 rounded-full blur-[110px] animate-float" />
    </div>
  );
}
