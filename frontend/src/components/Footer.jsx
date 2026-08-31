export default function Footer() {
  return (
    <footer className="bg-slate-800 text-stone-300 py-6 mt-auto shadow-inner">
      <div className="container mx-auto px-6 text-center text-sm">
        <p>© {new Date().getFullYear()} Book Fair Management System. All rights reserved.</p>
      </div>
    </footer>
  );
}
