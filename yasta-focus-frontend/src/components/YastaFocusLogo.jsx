export default function YastaFocusLogo() {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-2">
            {/* YASTA */}
            <div className="flex gap-1.5 text-4xl font-black tracking-[0.3em] text-white">
                <span>Y</span>
                <span>A</span>
                <span>S</span>
                <span>T</span>
                <span>A</span>
            </div>

            {/* FOCUS with rotating logo in O */}
            <div className="flex gap-1.5 text-4xl font-black tracking-[0.3em] text-white">
                <span>F</span>

                {/* O with rotating logo */}
                    <div className="relative inline-flex items-center justify-center w-[1.2em] h-[1.2em]">
                        <span className="z-10" style={{ visibility: 'hidden' }}>O</span>
                        <img
                            src="/Logo.svg"
                            alt="Yasta Focus Logo"
                            className="w-9 h-9  animate-spin-slow absolute left-[18px] top-[23px] -translate-x-1/2 -translate-y-1/2"
                            style={{ animationDuration: '8s' }}
                        />
                    </div>

                <span>C</span>
                <span>U</span>
                <span>S</span>
            </div>
        </div>
    )
}
