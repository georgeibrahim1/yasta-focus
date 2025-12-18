export default function YastaFocusLogo() {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-4" style={{ transform: 'translateY(-10px)' }}>
            {/* YASTA with stagger animation */}
            <div className="flex gap-1.5 text-4xl font-black tracking-[0.3em]">
                {['Y', 'A', 'S', 'T', 'A'].map((letter, i) => (
                    <span
                        key={i}
                        className="inline-block bg-gradient-to-br from-blue-300 to-purple-400 bg-clip-text text-transparent animate-float"
                        style={{
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: '3s'
                        }}
                    >
                        {letter}
                    </span>
                ))}
            </div>

            {/* FOCUS with rotating logo in O */}
            <div className="flex gap-1.5 text-4xl font-black tracking-[0.3em] items-center">
                {/* F */}
                <span className="inline-block bg-gradient-to-br from-blue-300 to-purple-400 bg-clip-text text-transparent animate-float" style={{ animationDelay: '0.5s', animationDuration: '3s' }}>
                    F
                </span>

                {/* O with rotating logo and glow */}
                <div className="relative inline-flex items-center justify-center w-[1.1em] h-[1.1em]">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                    
                    {/* Rotating logo */}
                    <div className="relative w-8 h-8 animate-spin-slow" style={{ animationDuration: '8s' }}>
                        <img
                            src="/Logo.svg"
                            alt="Yasta Focus Logo"
                            className="w-full h-full drop-shadow-[0_0_10px_rgba(167,139,250,0.6)]"
                        />
                    </div>
                </div>

                {/* C U S */}
                {['C', 'U', 'S'].map((letter, i) => (
                    <span
                        key={letter}
                        className="inline-block bg-gradient-to-br from-blue-300 to-purple-400 bg-clip-text text-transparent animate-float"
                        style={{
                            animationDelay: `${0.7 + i * 0.1}s`,
                            animationDuration: '3s'
                        }}
                    >
                        {letter}
                    </span>
                ))}
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-8px);
                    }
                }

                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }

                .animate-spin-slow {
                    animation: spin 8s linear infinite;
                }

                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    )
}