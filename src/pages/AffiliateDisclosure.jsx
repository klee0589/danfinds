import Breadcrumb from "../components/blog/Breadcrumb";

export default function AffiliateDisclosure() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-900 text-white py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <Breadcrumb items={[{ label: "Affiliate Disclosure" }]} />
          <h1 className="text-3xl font-extrabold mt-4">Affiliate Disclosure</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-10 prose text-gray-700 space-y-4">
        <p>DanFinds is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.</p>
        <p>When you click on links to Amazon products on this site and make a purchase, DanFinds may earn a small commission. This comes at <strong>no additional cost to you</strong>.</p>
        <p>These commissions help keep this site running and allow me to continue researching and testing products to give you the best recommendations possible.</p>
        <p>I only recommend products I believe are genuinely useful. Affiliate relationships do not influence my reviews or rankings — if a product isn't good, I say so.</p>
        <p>If you have any questions about this disclosure, please contact me at dan@danfinds.com.</p>
        <p className="text-sm text-gray-400">Last updated: January 2024</p>
      </div>
    </div>
  );
}