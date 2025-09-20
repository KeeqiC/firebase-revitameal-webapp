import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Komponen ini secara otomatis akan melakukan scroll ke elemen
 * yang memiliki ID sesuai dengan hash (#) di URL.
 */
function ScrollManager() {
  const { hash } = useLocation();

  useEffect(() => {
    // Jika ada hash di URL
    if (hash) {
      // Hapus karakter '#' untuk mendapatkan ID
      const id = hash.replace("#", "");
      const element = document.getElementById(id);

      // Jika elemen ditemukan, scroll ke sana dengan efek smooth
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }
    }
  }, [hash]); // Jalankan efek ini setiap kali hash berubah

  // Komponen ini tidak merender apapun ke layar
  return null;
}

export default ScrollManager;
