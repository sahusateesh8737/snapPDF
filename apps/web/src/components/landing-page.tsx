"use client";

import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/feature-card";
import { FileUp, Search, Zap, Shield, Merge, Scissors, Repeat } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

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

export default function LandingPage() {
  return (
    <>
      <section className="relative pt-32 pb-20 overflow-hidden bg-black">
        {/* Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
           <div className="absolute -top-24 left-1/4 w-96 h-96 bg-brand-500/30 rounded-full blur-[100px]" />
           <div className="absolute top-20 right-1/4 w-72 h-72 bg-purple-500/30 rounded-full blur-[100px]" />
        </div>
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
            { icon: <Repeat />, title: "Convert PDF", desc: "Convert your PDFs to Word, Excel, PowerPoint reliably.", variant: "orange", href: "/convert-pdf" },
            { icon: <Shield />, title: "Protect PDF", desc: "Encrypt your PDF with a password to keep data confidential.", variant: "default", href: "/protect-pdf" },
            { icon: <Search />, title: "OCR PDF", desc: "Make scanned documents searchable with advanced OCR.", variant: "default", href: "/ocr-pdf" }
          ].map((feature, idx) => (
             <motion.div key={idx} variants={itemVariants}>
               <Link href={feature.href ?? "#"}>
                 <FeatureCard 
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.desc}
                  variant={feature.variant as any}
                  className="h-full"
                 />
               </Link>
             </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Upload/CTA Section */}
      <section className="py-24 bg-zinc-900 relative overflow-hidden">
         {/* Decoration Circles */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
         <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
         
         <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
           <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to optimize your documents?</h2>
           <p className="text-slate-400 text-lg mb-10">Join thousands of users who trust SnapPDF for their daily document needs.</p>
           
           <motion.div 
             className="p-8 rounded-3xl border-2 border-dashed border-zinc-700 bg-zinc-800/50 backdrop-blur-sm hover:border-brand-500 hover:bg-zinc-800 transition-all cursor-pointer group"
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
           >
             <div className="flex flex-col items-center justify-center gap-4">
               <div className="w-16 h-16 rounded-full bg-zinc-700 flex items-center justify-center group-hover:bg-brand-600 transition-colors">
                 <FileUp className="text-slate-400 group-hover:text-white" size={32} />
               </div>
               <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Drop PDF files here</h3>
                  <p className="text-slate-400">or click to browse your computer</p>
               </div>
             </div>
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
