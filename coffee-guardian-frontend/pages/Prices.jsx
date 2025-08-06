import { useQuery } from "@tanstack/react-query";
import { getLatestPrices } from "../services/prices";
import Loading from "../components/common/Loading";

export default function Prices() {
  const { data, isLoading } = useQuery(["prices"], getLatestPrices);

  if (isLoading) return <Loading />;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Latest Market Prices</h1>
      <table className="w-full bg-white rounded shadow">
        <thead className="bg-green-600 text-white">
          <tr>
            <th className="p-2">Crop</th>
            <th>Variety</th>
            <th>Market</th>
            <th>Price</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={`${row.crop}-${row.market}-${row.variety}`}
              className="text-center border-b last:border-none"
            >
              <td className="p-2">{row.crop}</td>
              <td>{row.variety}</td>
              <td>{row.market}</td>
              <td>{row.price}</td>
              <td>{new Date(row.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
