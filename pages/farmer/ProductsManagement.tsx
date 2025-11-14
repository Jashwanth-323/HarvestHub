
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Product } from '../../types';
import { CATEGORIES } from '../../constants';
import { PencilIcon, TrashIcon, PlusCircleIcon, XIcon } from '../../components/icons';

// FIX: Added missing 'farm' property to satisfy the Omit<Product, 'id' | 'farmerId'> type.
const emptyProduct: Omit<Product, 'id' | 'farmerId'> = {
  name: '', farm: '', description: '', price: 0, unit: 'kg', stock: 0, category: CATEGORIES[0]?.name || '', image: '',
};

const ProductModal: React.FC<{
  product: Omit<Product, 'id' | 'farmerId'> | Product;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id' | 'farmerId'> | Product) => void;
}> = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState(product);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <XIcon className="h-6 w-6"/>
        </button>
        <h2 className="text-2xl font-bold mb-4">{'id' in product ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
          </div>
          {/* FIX: Added input field for farm name. */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Farm Name</label>
            <input type="text" name="farm" value={(formData as Product).farm} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input type="text" name="image" value={formData.image} onChange={handleChange} required placeholder="https://picsum.photos/400" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <select name="unit" value={formData.unit} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    <option value="kg">per kg</option>
                    <option value="piece">per piece</option>
                </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Stock</label>
                <input type="number" name="stock" value={formData.stock} onChange={handleChange} required min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                {CATEGORIES.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md mr-2">Cancel</button>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Save Product</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProductsManagement: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useData();
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const farmerProducts = products.filter(p => p.farmerId === currentUser?.id);

  const handleOpenModal = (product: Product | null = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };
  
  const handleSaveProduct = (productData: Omit<Product, 'id' | 'farmerId'> | Product) => {
    if ('id' in productData) {
        updateProduct(productData);
    } else if (currentUser) {
        addProduct(productData, currentUser.id);
    }
    handleCloseModal();
  };

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Your Products</h2>
            <button onClick={() => handleOpenModal()} className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                <PlusCircleIcon className="h-5 w-5 mr-2"/>
                Add Product
            </button>
        </div>

        {isModalOpen && (
            <ProductModal 
                product={editingProduct || emptyProduct} 
                onClose={handleCloseModal} 
                onSave={handleSaveProduct} 
            />
        )}
      
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {farmerProducts.map(product => (
                        <tr key={product.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                        <img className="h-10 w-10 rounded-full object-cover" src={product.image} alt={product.name}/>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price.toFixed(2)} / {product.unit}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => handleOpenModal(product)} className="text-indigo-600 hover:text-indigo-900 mr-4"><PencilIcon className="h-5 w-5"/></button>
                                <button onClick={() => deleteProduct(product.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5"/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default ProductsManagement;