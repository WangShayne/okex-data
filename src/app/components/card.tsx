export default function Card({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="bg-white rounded-lg p-4 shadow-md relative">
            {children}
        </div>
    );
}
