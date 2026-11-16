using System.Text.Json;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace QuoteRazor.Pages;

public class IndexModel : PageModel
{
    public sealed record Quote(string Text, string Author, string Context);

    private static readonly JsonSerializerOptions QuoteJsonOptions = new(JsonSerializerDefaults.Web);

    public IReadOnlyList<Quote> Quotes { get; } =
    [
        new("Gurun mengajarkan kita bahwa kekosongan bukanlah kehampaan, melainkan ruang luas untuk mendengar detak jiwa yang paling purba.",
            "Pramoedya Ananta Toer", "Catatan Sunyi • Renungan Ketabahan"),
        new("Di tengah padang gersang sekalipun, akar pohon yang sabar tidak pernah berputus asa mencari mata air tersembunyi.",
            "Sapardi Djoko Damono", "Sajak Keheningan • Keteguhan Hati"),
        new("Jangan mencemaskan keringnya tanah di sekelilingmu. Kekuatan sejati bertumbuh ketika engkau tetap berdiri saat segalanya layu.",
            "Kahlil Gibran", "Suara Jiwa • Hikmah Gurun"),
        new("Keheningan gurun bukanlah ketiadaan suara, melainkan nyanyian angin yang hanya bisa dipahami oleh hati yang telah selesai dengan dirinya sendiri.",
            "Jalaluddin Rumi", "Kidung Sunyi • Kedamaian Batin"),
        new("Sebatang pohon yang mati di pasir tandus tetap tegak memberi siluet keindahan pada senja yang temaram.",
            "Chairil Anwar", "Deru Campur Debu • Martabat Hidup"),
        new("Waktu seperti pasir yang berhembus di bukit buana. Ia membentuk lekuk baru tanpa pernah terburu-buru oleh jerit manusia.",
            "Goenawan Mohamad", "Catatan Pinggir • Relativitas Waktu"),
        new("Hanya mereka yang berani melintasi padang tandus yang mengerti betapa sucinya setetes embun di pagi hari.",
            "Buya Hamka", "Tuntunan Jiwa • Makna Syukur"),
        new("Jadilah seperti semak gurun: sederhana, tak banyak menuntut, namun sanggup bertahan melewati musim kemarau terpanjang.",
            "Mochtar Lubis", "Senja di Jakarta • Ketahanan Nurani")
    ];

    public Quote CurrentQuote => Quotes[0];

    public int QuoteCount => Quotes.Count;

    public string QuotesJson => JsonSerializer.Serialize(Quotes, QuoteJsonOptions);

    public void OnGet()
    {
    }
}
