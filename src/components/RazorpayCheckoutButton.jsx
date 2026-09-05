import { toast } from "sonner";

export default function RazorpayCheckoutButton({ examId, title, onSuccess }) {
  const [loading, setLoading] = useState(false);
  async function pay() {
    setLoading(true);
    try {
      const r = await fetch("/api/payments/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Unable to create order");
      if (d.alreadyPurchased) {
        toast.info("Exam is already unlocked!");
        onSuccess?.();
        return;
      }
      const script = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!script) throw new Error("Razorpay checkout failed to load");
      const rz = new window.Razorpay({
        key: d.keyId,
        amount: d.amount,
        currency: d.currency,
        name: "MahaExam",
        description: title,
        order_id: d.orderId,
        handler: async (response) => {
          const vr = await fetch("/api/payments/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const vd = await vr.json();
          if (!vr.ok) toast.error(vd.error || "Payment verification failed");
          else {
            toast.success("🎉 Payment verified! Exam unlocked successfully.");
            onSuccess?.();
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rz.open();
    } catch (e) {
      toast.error(e.message);
      setLoading(false);
    }
  }
  return (
    <button
      onClick={pay}
      disabled={loading}
      className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white disabled:opacity-50"
    >
      {loading ? "Opening payment..." : "Pay & Unlock Exam"}
    </button>
  );
}
function loadScript(src) {
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}
