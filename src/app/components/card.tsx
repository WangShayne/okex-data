export default function Card({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="bg-bg-300 rounded-lg  shadow-md relative">
            {children}
        </div>
    );
}
