// src/components/Footer.jsx

function Footer() {
  return (
    <footer className="bg-[#B23501]/80 backdrop-blur-md text-white py-6 mt-auto">
      <div className="container mx-auto text-center px-4">
        <p>
          &copy; {new Date().getFullYear()} Revitameal. All rights reserved.
        </p>
        {/* Konten footer lainnya bisa ditambahkan di sini */}
      </div>
    </footer>
  );
}

export default Footer;
