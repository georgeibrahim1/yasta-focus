export default function YastaFocusRowLogo() {
    return (
        <div className="flex items-center gap-2 select-none">
            <img
                src="/Logo.svg"
                alt="Yasta Focus Logo"
                className="w-3.5 h-3.5 animate-spin-slow"
                style={{ animationDuration: '10s' }}
            />
            <span className="font-bold text-xs tracking-[0.3em] text-white">
                YASTA <span className="text-purple-500">FOCUS</span>
            </span>
        </div>
    )
}
