"use client";

import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/feature-card";
import { FileUp, Search, Zap, Shield, Merge, Scissors, Repeat, MousePointerClick, Cpu, Download } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MaskReveal } from "@/components/ui/mask-reveal";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 40, opacity: 0, filter: "blur(8px)" },
  visible: { 
    y: 0, 
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      stiffness: 80,
      damping: 15
    }
  }
};

import { IsometricGrid } from "@/components/ui/isometric-grid";

export default function LandingPage() {
  return (
    <>
      <MaskReveal />
      <section className="relative pt-32 pb-20 overflow-hidden bg-black min-h-[90vh] flex flex-col justify-center">
        <IsometricGrid />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black pointer-events-none" /> {/* Fade to black at bottom */}
        <motion.div 
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
             {/* Optional: Small pill or remove if too noisy */}
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6">
            Every tool you need to work with <span className="text-brand-600">PDFs</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Merge, split, compress, and convert PDFs in seconds. 
            Secure, fast, and completely free tools for your documents.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <Link href="/tools" className="bg-brand-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-brand-700 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center justify-center">
                Explore All PDF Tools
             </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {[
            { icon: <Merge />, title: "Merge PDF", desc: "Combine multiple PDFs into one unified document.", variant: "red", href: "/merge-pdf" },
            { icon: <Scissors />, title: "Split PDF", desc: "Separate one page or a whole set for easy conversion.", variant: "blue", href: "/split-pdf" },
            { icon: <Zap />, title: "Compress PDF", desc: "Reduce file size while optimizing for maximal PDF quality.", variant: "green", href: "/compress-pdf" },
            { icon: <Repeat />, title: "Convert PDF", desc: "Convert your PDFs to Word, Excel, PowerPoint reliably.", variant: "orange", href: "/convert-pdf", comingSoon: true },
            { icon: <Shield />, title: "Protect PDF", desc: "Encrypt your PDF with a password to keep data confidential.", variant: "default", href: "/protect-pdf", comingSoon: true },
            { icon: <Search />, title: "OCR PDF", desc: "Make scanned documents searchable with advanced OCR.", variant: "default", href: "/ocr-pdf" }
          ].map((feature, idx) => (
             <motion.div key={idx} variants={itemVariants}>
               <Link href={feature.href ?? "#"}>
                 <FeatureCard 
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.desc}
                  variant={feature.variant as any}
                  comingSoon={feature.comingSoon}
                  className="h-full"
                 />
               </Link>
             </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-zinc-900 relative overflow-hidden">
         {/* Animated Decoration Circles */}
         <motion.div 
           animate={{ 
             scale: [1, 1.2, 1],
             opacity: [0.1, 0.2, 0.1],
           }}
           transition={{ 
             duration: 8,
             repeat: Infinity,
             ease: "easeInOut" 
           }}
           className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" 
         />
         <motion.div 
            animate={{ 
             scale: [1, 1.5, 1],
             opacity: [0.1, 0.2, 0.1],
           }}
           transition={{ 
             duration: 10,
             repeat: Infinity,
             ease: "easeInOut",
             delay: 1
           }}
           className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" 
         />
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <motion.div 
             className="text-center mb-16"
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true, margin: "-100px" }}
             variants={containerVariants}
           >
             <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-bold text-white mb-6">
               Why use SnapPDF?
             </motion.h2>
             <motion.p variants={itemVariants} className="text-slate-400 text-lg max-w-2xl mx-auto">
               We prioritize your privacy and speed. Experience the next generation of PDF tools.
             </motion.p>
           </motion.div>

           <motion.div 
             className="grid grid-cols-1 md:grid-cols-3 gap-8"
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true, margin: "-100px" }}
             variants={containerVariants}
           >
             {[
               { 
                 icon: <MousePointerClick className="text-brand-500" size={32} />, 
                 title: "Easy to Use", 
                 desc: "Just drag & drop your files. Our intuitive interface makes editing PDFs a breeze." 
               },
               { 
                 icon: <Cpu className="text-blue-500" size={32} />, 
                 title: "Client-Side Processing", 
                 desc: "Your files never leave your browser. We process everything locally using WebAssembly for maximum privacy." 
               },
               { 
                 icon: <Download className="text-green-500" size={32} />, 
                 title: "Instant Results", 
                 desc: "No waiting for uploads or server queues. Get your edited PDF immediately." 
               }
             ].map((item, idx) => (
                <motion.div 
                  key={idx} 
                  variants={itemVariants}
                  className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 p-8 rounded-2xl hover:bg-zinc-800 transition-colors"
                >
                  <div className="w-14 h-14 rounded-xl bg-zinc-900/80 flex items-center justify-center mb-6 border border-zinc-800">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                </motion.div>
             ))}
           </motion.div>
         </div>
      </section>
      
      {/* Simple Footer */}
      <footer className="py-12 bg-black border-t border-zinc-900 text-center text-slate-500">
        <p>&copy; {new Date().getFullYear()} SnapPDF. All rights reserved.</p>
      </footer>
    </>
  );
}
