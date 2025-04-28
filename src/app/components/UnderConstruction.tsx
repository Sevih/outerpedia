import Image from "next/image";

export default function UnderConstruction() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
            <Image
                src="/images/ui/underconstruc.webp"
                alt="Page en construction"
                width={450}
                height={450}
                style={{ width: 450, height: 450 }}
                unoptimized
            />
            <h1 className="text-4xl font-bold mb-4">🚧 Page en construction 🚧</h1>
            <p className="text-lg text-gray-600">Nous travaillons dessus. Revenez bientôt !</p>
        </div>
    );
}
