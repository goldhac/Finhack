export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full z-50 h-8 flex justify-between items-center px-6 bg-[#0E0E0E] text-[#C6C6C6] font-['Inter'] text-[10px] font-medium tracking-tighter">
      <div>
        QUANTUM_LEDGER_V.1.0.4 // [STABLE_BUILD]
      </div>
      <div className="flex gap-6">
        <a className="hover:text-[#0F62FE] transition-colors" href="#">
          Privacy.md
        </a>
        <a className="hover:text-[#0F62FE] transition-colors" href="#">
          SLA.txt
        </a>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#0F62FE] pulse-dot" />
          <span className="text-white">Node_Status: ACTIVE</span>
        </div>
      </div>
    </footer>
  )
}
