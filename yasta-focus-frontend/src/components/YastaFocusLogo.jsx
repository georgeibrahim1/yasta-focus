export default function YastaFocusLogo() {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-2">
            {/* YASTA */}
            <div className="flex gap-1.5 text-4xl font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-white via-[#8b8bf1] to-[#6366F1]">
                <span>Y</span>
                <span>A</span>
                <span>S</span>
                <span>T</span>
                <span>A</span>
            </div>

            {/* FOCUS with rotating logo in O */}
            <div className="flex gap-1.5 text-4xl font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] via-[#8b8bf1] to-white">
                <span>F</span>

                {/* O with rotating logo */}
                <div className="relative inline-flex items-center justify-center">
                    <span>O</span>
                    <div className="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center">
                        <img
                            src="/Logo.svg"
                            alt="Yasta Focus Logo"
                            className="w-7 h-7 animate-spin-slow"
                            style={{ animationDuration: '8s' }}
                        />
                    </div>
                </div>

                <span>C</span>
                <span>U</span>
                <span>S</span>
            </div>
        </div>
    )
}
