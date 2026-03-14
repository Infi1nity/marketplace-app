import { useParams } from 'react-router';

export default function ProductDetail() {
  const { id } = useParams();
  return <h1>Товар с ID: {id}</h1>;
}