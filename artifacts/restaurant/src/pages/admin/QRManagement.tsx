import { useState } from "react";
import { QrCode, Download, Plus, Trash2 } from "lucide-react";
import QRCode from "qrcode";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { setItem } from "@/lib/rtdb";

interface QREntry { id: string; label: string; url: string; dataUrl: string }

export default function QRManagement() {
  const { isAdmin } = useAuth();
  const [, navigate] = useLocation();
  const [entries, setEntries] = useState<QREntry[]>([]);
  const [tableNumber, setTableNumber] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!isAdmin) navigate("/");
  }, [isAdmin]);

  const baseUrl = window.location.origin;

  async function generateQR(label: string, path: string) {
    const url = `${baseUrl}${path}`;
    const dataUrl = await QRCode.toDataURL(url, { width: 400, margin: 2, color: { dark: "#1a0a00", light: "#ffffff" } });
    return { id: Date.now().toString(), label, url, dataUrl };
  }

  async function addMenuQR() {
    setGenerating(true);
    const entry = await generateQR("General Menu", "/menu");
    await setItem("tables/general", { number: "general", qrCode: entry.url });
    setEntries((prev) => [entry, ...prev]);
    setGenerating(false);
  }

  async function addTableQR() {
    if (!tableNumber) return;
    setGenerating(true);
    const entry = await generateQR(`Table ${tableNumber}`, `/table/${tableNumber}`);
    await setItem(`tables/${tableNumber}`, { number: tableNumber, qrCode: entry.url });
    setEntries((prev) => [entry, ...prev]);
    setTableNumber("");
    setGenerating(false);
  }

  function downloadQR(entry: QREntry) {
    const a = document.createElement("a");
    a.href = entry.dataUrl;
    a.download = `qr-${entry.label.toLowerCase().replace(/\s+/g, "-")}.png`;
    a.click();
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white py-6 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <QrCode className="w-6 h-6" />
          <div>
            <h1 className="text-2xl font-extrabold">QR Code Generator</h1>
            <p className="text-white/70 text-sm">Create QR codes for tables and menus</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Generator */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h2 className="font-bold text-foreground">Generate New QR Code</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={addMenuQR}
              disabled={generating}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              <QrCode className="w-4 h-4" />
              General Menu QR
            </button>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Table number (e.g. 5)"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="flex-1 border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={addTableQR}
                disabled={!tableNumber || generating}
                className="flex items-center gap-1 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 disabled:opacity-60 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Table QR
              </button>
            </div>
          </div>
        </div>

        {/* QR Grid */}
        {entries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map((entry) => (
              <div key={entry.id} className="bg-card border border-border rounded-2xl p-4 text-center shadow-sm">
                <img src={entry.dataUrl} alt={entry.label} className="w-48 h-48 mx-auto mb-3 rounded-xl" />
                <p className="font-bold text-foreground mb-0.5">{entry.label}</p>
                <p className="text-xs text-muted-foreground truncate mb-3">{entry.url}</p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => downloadQR(entry)}
                    className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                  <button
                    onClick={() => setEntries((prev) => prev.filter((e) => e.id !== entry.id))}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {entries.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <QrCode className="w-14 h-14 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No QR codes generated yet</p>
            <p className="text-sm">Create one above for the menu or a specific table</p>
          </div>
        )}
      </div>
    </div>
  );
}
