import { Ruler, Info } from "lucide-react"

const sizeData = {
  women: [
    { size: "XS", bust: "32-33", waist: "24-25", hips: "34-35", us: "0-2", uk: "4-6", eu: "32-34" },
    { size: "S", bust: "34-35", waist: "26-27", hips: "36-37", us: "4-6", uk: "8-10", eu: "36-38" },
    { size: "M", bust: "36-37", waist: "28-29", hips: "38-39", us: "8-10", uk: "12-14", eu: "40-42" },
    { size: "L", bust: "38-40", waist: "30-32", hips: "40-42", us: "12-14", uk: "16-18", eu: "44-46" },
    { size: "XL", bust: "41-43", waist: "33-35", hips: "43-45", us: "16-18", uk: "20-22", eu: "48-50" },
    { size: "XXL", bust: "44-46", waist: "36-38", hips: "46-48", us: "20-22", uk: "24-26", eu: "52-54" },
    { size: "3XL", bust: "47-49", waist: "39-41", hips: "49-51", us: "22-24", uk: "26-28", eu: "54-56" },
    { size: "4XL", bust: "50-52", waist: "42-44", hips: "52-54", us: "24-26", uk: "28-30", eu: "56-58" },
    { size: "5XL", bust: "53-55", waist: "45-47", hips: "55-57", us: "26-28", uk: "30-32", eu: "58-60" },
  ],
  men: [
    { size: "XS", chest: "34-36", waist: "28-30", hips: "34-36", us: "34", uk: "34", eu: "44" },
    { size: "S", chest: "36-38", waist: "30-32", hips: "36-38", us: "36", uk: "36", eu: "46" },
    { size: "M", chest: "38-40", waist: "32-34", hips: "38-40", us: "38", uk: "38", eu: "48" },
    { size: "L", chest: "40-42", waist: "34-36", hips: "40-42", us: "40", uk: "40", eu: "50" },
    { size: "XL", chest: "42-44", waist: "36-38", hips: "42-44", us: "42", uk: "42", eu: "52" },
    { size: "XXL", chest: "44-46", waist: "38-40", hips: "44-46", us: "44", uk: "44", eu: "54" },
    { size: "3XL", chest: "46-48", waist: "40-42", hips: "46-48", us: "46", uk: "46", eu: "56" },
    { size: "4XL", chest: "48-50", waist: "42-44", hips: "48-50", us: "48", uk: "48", eu: "58" },
    { size: "5XL", chest: "50-52", waist: "44-46", hips: "50-52", us: "50", uk: "50", eu: "60" },
  ],
  kids: [
    { size: "2-3Y", height: "38-40", chest: "22-23", waist: "20-21", hips: "22-23", weight: "12-14" },
    { size: "4-5Y", height: "42-44", chest: "23-24", waist: "21-22", hips: "23-24", weight: "16-18" },
    { size: "6-7Y", height: "46-48", chest: "25-26", waist: "22-23", hips: "25-26", weight: "20-24" },
    { size: "8-9Y", height: "50-52", chest: "27-28", waist: "23-24", hips: "27-28", weight: "26-30" },
    { size: "10-11Y", height: "54-56", chest: "29-30", waist: "24-25", hips: "29-30", weight: "32-36" },
    { size: "12-13Y", height: "58-60", chest: "31-32", waist: "26-27", hips: "31-32", weight: "38-44" },
    { size: "14-15Y", height: "62-64", chest: "33-34", waist: "28-29", hips: "33-34", weight: "46-52" },
  ],
}

function Table({ headers, rows }: { headers: string[]; rows: Record<string, string>[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-cavree-border">
            {headers.map((h) => (
              <th key={h} className="text-left py-3 px-3 font-montserrat font-semibold text-xs uppercase tracking-wide text-cavree-muted whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-cavree-border last:border-0 hover:bg-cavree-light transition-colors">
              {Object.values(row).map((val, j) => (
                <td key={j} className="py-3 px-3 font-poppins text-cavree-foreground whitespace-nowrap">
                  {val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function SizeGuidePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-playfair text-4xl md:text-5xl font-bold">Size Guide</h1>
        <p className="mt-4 text-cavree-muted font-poppins max-w-2xl mx-auto">
          Use the charts below to find your perfect fit. All measurements are in inches.
        </p>
      </div>

      {/* How to measure */}
      <div className="flex items-start gap-3 p-5 bg-cavree-light rounded-lg mb-10">
        <Info size={20} className="text-cavree-primary mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-montserrat font-semibold text-sm mb-1">How to Measure</h3>
          <p className="text-sm text-cavree-muted font-poppins leading-relaxed">
            Use a soft measuring tape and keep it snug but not tight. For best results, measure over lightweight clothing or underwear.
            Bust/Chest: Measure around the fullest part. Waist: Measure around the narrowest part. Hips: Measure around the widest part.
          </p>
        </div>
      </div>

      {/* Women */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-cavree-primary/10 flex items-center justify-center">
            <Ruler size={20} className="text-cavree-primary" />
          </div>
          <h2 className="font-montserrat font-semibold text-xl">Women&apos;s Sizes</h2>
        </div>
        <div className="border border-cavree-border rounded-lg p-4">
          <Table
            headers={["Size", "Bust (in)", "Waist (in)", "Hips (in)", "US", "UK", "EU"]}
            rows={sizeData.women}
          />
        </div>
      </div>

      {/* Men */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-cavree-primary/10 flex items-center justify-center">
            <Ruler size={20} className="text-cavree-primary" />
          </div>
          <h2 className="font-montserrat font-semibold text-xl">Men&apos;s Sizes</h2>
        </div>
        <div className="border border-cavree-border rounded-lg p-4">
          <Table
            headers={["Size", "Chest (in)", "Waist (in)", "Hips (in)", "US", "UK", "EU"]}
            rows={sizeData.men}
          />
        </div>
      </div>

      {/* Kids */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-cavree-primary/10 flex items-center justify-center">
            <Ruler size={20} className="text-cavree-primary" />
          </div>
          <h2 className="font-montserrat font-semibold text-xl">Kids&apos; Sizes</h2>
        </div>
        <div className="border border-cavree-border rounded-lg p-4">
          <Table
            headers={["Age", "Height (in)", "Chest (in)", "Waist (in)", "Hips (in)", "Weight (kg)"]}
            rows={sizeData.kids}
          />
        </div>
      </div>

      <div className="text-center p-6 bg-cavree-light rounded-lg">
        <p className="text-sm text-cavree-muted font-poppins">
          Between sizes? We recommend sizing up for a comfortable fit. Need help?{" "}
          <a href="mailto:support@cavree.com" className="text-cavree-primary hover:underline font-medium">
            Contact us
          </a>
          .
        </p>
      </div>
    </div>
  )
}
