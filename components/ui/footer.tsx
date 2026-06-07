export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-6 text-sm text-slate-600 flex items-center justify-between">
        <div>© {new Date().getFullYear()} Meet — All rights reserved.</div>
        <div>
          <a href="/contact" className="hover:text-slate-900">聯絡我們</a>
        </div>
      </div>
    </footer>
  );
}
