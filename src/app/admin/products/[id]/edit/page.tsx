import ProductForm from "@/components/admin/ProductForm"

export default function EditProductPage({ params }: { params: { id: string } }) {
  return <ProductForm mode="edit" productId={params.id} />
}
