import re

with open('/flocred/app/HomeClient.tsx', 'r') as f:
    content = f.read()

# Define replacement rules: (pattern, replacement)
replacements = [
    # Section containers
    ('className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"', 'style={{maxWidth:"80rem",margin:"0 auto",padding:"0 24px"}}'),
    ('className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full"', 'style={{maxWidth:"80rem",margin:"0 auto",padding:"0 24px",position:"relative",zIndex:10,width:"100%"}}'),
    ('className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"', 'style={{maxWidth:"72rem",margin:"0 auto",padding:"0 24px"}}'),
    ('className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"', 'style={{maxWidth:"64rem",margin:"0 auto",padding:"0 24px"}}'),
    ('className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"', 'style={{maxWidth:"56rem",margin:"0 auto",padding:"0 24px"}}'),
    ('className="max-w-3xl mx-auto text-center mb-12"', 'style={{maxWidth:"48rem",margin:"0 auto 48px",textAlign:"center"}}'),
    ('className="max-w-2xl mx-auto text-center mb-12"', 'style={{maxWidth:"42rem",margin:"0 auto 48px",textAlign:"center"}}'),
    ('className="max-w-2xl mx-auto text-center mb-10"', 'style={{maxWidth:"42rem",margin:"0 auto 40px",textAlign:"center"}}'),
    ('className="text-center mb-12"', 'style={{textAlign:"center",marginBottom:48}}'),
    ('className="text-center mb-10"', 'style={{textAlign:"center",marginBottom:40}}'),
    ('className="text-center mb-8"', 'style={{textAlign:"center",marginBottom:32}}'),
    # Typography
    ('className="text-xs tracking-[.15em] uppercase font-semibold mb-3"', 'style={{fontSize:11,letterSpacing:".15em",textTransform:"uppercase",fontWeight:600,marginBottom:12}}'),
    ('className="text-xs tracking-[.15em] uppercase font-semibold mb-2"', 'style={{fontSize:11,letterSpacing:".15em",textTransform:"uppercase",fontWeight:600,marginBottom:8}}'),
    ('className="text-3xl sm:text-4xl font-bold mb-4"', 'style={{fontSize:"clamp(28px,4vw,36px)",fontWeight:700,marginBottom:16,fontFamily:"Fraunces,serif"}}'),
    ('className="text-2xl font-bold mb-3"', 'style={{fontSize:24,fontWeight:700,marginBottom:12,fontFamily:"Fraunces,serif"}}'),
    ('className="text-sm leading-relaxed"', 'style={{fontSize:14,lineHeight:1.7}}'),
    ('className="text-xs leading-relaxed"', 'style={{fontSize:12,lineHeight:1.7}}'),
    # Flex
    ('className="flex items-center gap-2"', 'style={{display:"flex",alignItems:"center",gap:8}}'),
    ('className="flex items-center gap-3"', 'style={{display:"flex",alignItems:"center",gap:12}}'),
    ('className="flex items-center gap-4"', 'style={{display:"flex",alignItems:"center",gap:16}}'),
    ('className="flex items-center justify-between"', 'style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}'),
    ('className="flex items-center justify-center"', 'style={{display:"flex",alignItems:"center",justifyContent:"center"}}'),
    ('className="flex flex-col gap-3"', 'style={{display:"flex",flexDirection:"column",gap:12}}'),
    ('className="flex flex-col gap-2"', 'style={{display:"flex",flexDirection:"column",gap:8}}'),
    ('className="flex gap-3 flex-wrap"', 'style={{display:"flex",gap:12,flexWrap:"wrap"}}'),
    ('className="flex gap-2 flex-wrap"', 'style={{display:"flex",gap:8,flexWrap:"wrap"}}'),
    ('className="flex gap-2"', 'style={{display:"flex",gap:8}}'),
    ('className="flex gap-3"', 'style={{display:"flex",gap:12}}'),
    ('className="flex gap-4"', 'style={{display:"flex",gap:16}}'),
    ('className="flex gap-8"', 'style={{display:"flex",gap:32}}'),
    # Spacing
    ('className="mb-1"', 'style={{marginBottom:4}}'),
    ('className="mb-2"', 'style={{marginBottom:8}}'),
    ('className="mb-3"', 'style={{marginBottom:12}}'),
    ('className="mb-4"', 'style={{marginBottom:16}}'),
    ('className="mb-5"', 'style={{marginBottom:20}}'),
    ('className="mb-6"', 'style={{marginBottom:24}}'),
    ('className="mb-8"', 'style={{marginBottom:32}}'),
    ('className="mb-10"', 'style={{marginBottom:40}}'),
    ('className="mb-12"', 'style={{marginBottom:48}}'),
    ('className="mt-1"', 'style={{marginTop:4}}'),
    ('className="mt-2"', 'style={{marginTop:8}}'),
    ('className="mt-3"', 'style={{marginTop:12}}'),
    ('className="mt-4"', 'style={{marginTop:16}}'),
    ('className="mt-6"', 'style={{marginTop:24}}'),
    ('className="mt-8"', 'style={{marginTop:32}}'),
    # Space-y using gap in flex column
    ('className="space-y-3"', 'style={{display:"flex",flexDirection:"column",gap:12}}'),
    ('className="space-y-2"', 'style={{display:"flex",flexDirection:"column",gap:8}}'),
    ('className="space-y-4"', 'style={{display:"flex",flexDirection:"column",gap:16}}'),
    # Sizing
    ('className="w-full"', 'style={{width:"100%"}}'),
    ('className="w-1.5 h-1.5 rounded-full"', 'style={{width:6,height:6,borderRadius:"50%"}}'),
    # Grids
    ('className="grid grid-cols-2 gap-3"', 'style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}'),
    ('className="grid grid-cols-2 gap-4"', 'style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}'),
    ('className="grid grid-cols-3 gap-2 text-[10px]"', 'style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,fontSize:10}}'),
    # Buttons
    ('className="btn-gold px-6 py-3 rounded-xl text-sm"', 'style={{background:"#C9A84C",color:"#0D0D0D",fontWeight:600,border:"none",cursor:"pointer",padding:"10px 24px",borderRadius:12,fontSize:13,display:"inline-flex",alignItems:"center",gap:8,textDecoration:"none",fontFamily:"Inter,system-ui"}}'),
    ('className="btn-gold px-5 py-2 rounded-xl text-xs flex-shrink-0"', 'style={{background:"#C9A84C",color:"#0D0D0D",fontWeight:600,border:"none",cursor:"pointer",padding:"8px 20px",borderRadius:10,fontSize:12,display:"inline-flex",alignItems:"center",gap:6,textDecoration:"none",fontFamily:"Inter,system-ui",flexShrink:0}}'),
    ('className="btn-gold w-full py-3 rounded-xl text-sm justify-center"', 'style={{background:"#C9A84C",color:"#0D0D0D",fontWeight:600,border:"none",cursor:"pointer",width:"100%",padding:"12px",borderRadius:12,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:"Inter,system-ui"}}'),
    ('className="btn-ghost px-5 py-2 rounded-xl text-sm"', 'style={{background:"transparent",border:"1px solid rgba(255,255,255,.15)",color:"#F5F0E8",fontWeight:500,cursor:"pointer",padding:"8px 20px",borderRadius:12,fontSize:13,display:"inline-flex",alignItems:"center",gap:8,textDecoration:"none",fontFamily:"Inter,system-ui"}}'),
    # Inputs
    ('className="input-dark"', 'style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#F5F0E8",borderRadius:10,padding:"11px 14px",fontSize:13,fontFamily:"Inter,system-ui",outline:"none",width:"100%"}}'),
    ('className="input-dark font-mono"', 'style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#F5F0E8",borderRadius:10,padding:"11px 14px",fontSize:13,fontFamily:"monospace",outline:"none",width:"100%"}}'),
    ('className="input-dark" style={{appearance:\'none\'}}'  , 'style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#F5F0E8",borderRadius:10,padding:"11px 14px",fontSize:13,fontFamily:"Inter,system-ui",outline:"none",width:"100%",appearance:"none"}}'),
    # Input light
    ('className="input-light"', 'style={{background:"rgba(255,255,255,.7)",border:"1px solid rgba(0,0,0,.12)",color:"#0D0D0D",borderRadius:10,padding:"11px 14px",fontSize:13,fontFamily:"Inter,system-ui",outline:"none",width:"100%"}}'),
    # Cards
    ('className="card-warm p-5 group cursor-pointer block"', 'style={{background:"#fff",border:"1px solid rgba(0,0,0,.07)",borderRadius:16,padding:20,cursor:"pointer",display:"block",textDecoration:"none",transition:"all .2s"}}'),
    ('className="card-warm p-6 group cursor-pointer block"', 'style={{background:"#fff",border:"1px solid rgba(0,0,0,.07)",borderRadius:16,padding:24,cursor:"pointer",display:"block",textDecoration:"none",transition:"all .2s"}}'),
    # Misc
    ('className="absolute inset-0"', 'style={{position:"absolute",inset:0}}'),
    ('className="relative"', 'style={{position:"relative"}}'),
    ('className="overflow-hidden"', 'style={{overflow:"hidden"}}'),
    ('className="text-center"', 'style={{textAlign:"center"}}'),
]

for old, new in replacements:
    content = content.replace(old, new)

with open('/flocred/app/HomeClient.tsx', 'w') as f:
    f.write(content)

print("Done")
