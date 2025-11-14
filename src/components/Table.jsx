import React from 'react';

const Table = ({ products, onDelete, readOnly = false }) => (
	<table className="w-full border-collapse rounded-lg overflow-hidden shadow text-sm sm:text-base">
		<thead>
			<tr className="bg-gradient-to-r from-amber-200 to-yellow-100">
				<th className="p-2 sm:p-3 text-left font-bold text-amber-800 text-xs sm:text-sm">🍴 Name</th>
				<th className="p-2 sm:p-3 text-left font-bold text-amber-800 text-xs sm:text-sm">📅 Expiry</th>
				<th className="p-2 sm:p-3 text-left font-bold text-amber-800 text-xs sm:text-sm">⚖️ Qty</th>
				<th className="p-2 sm:p-3 text-left font-bold text-amber-800 text-xs sm:text-sm">🔧 Actions</th>
			</tr>
		</thead>
		<tbody>
			{products.length === 0 ? (
				<tr>
					<td colSpan={4} className="text-center p-6 sm:p-8 text-amber-400 text-sm sm:text-base">
						<div className="flex flex-col items-center">
							<span className="text-2xl sm:text-4xl mb-2">🛒</span>
							<span>No food items found. Start scanning!</span>
						</div>
					</td>
				</tr>
			) : (
				products.map((product, idx) => (
					<tr key={product.id || idx} className={idx % 2 === 0 ? 'bg-amber-50' : 'bg-white'}>
						<td className="p-2 sm:p-3 border-b border-amber-100 text-xs sm:text-sm">{product.name}</td>
						<td className="p-2 sm:p-3 border-b border-amber-100 text-xs sm:text-sm">{new Date(product.date).toLocaleDateString()}</td>
						<td className="p-2 sm:p-3 border-b border-amber-100 text-xs sm:text-sm">{product.quantity}</td>
						<td className="p-2 sm:p-3 border-b border-amber-100">
							{readOnly ? (
								<button
									type="button"
									className="bg-gray-200 text-gray-500 px-2 sm:px-3 py-1 rounded-full cursor-not-allowed flex items-center justify-center space-x-1 text-xs sm:text-sm"
									disabled
								>
									<span>🔒</span>
									<span className="hidden sm:inline">Read-only</span>
								</button>
							) : (
								<button
									className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 sm:px-3 py-1 rounded-full hover:from-red-600 hover:to-red-700 shadow-sm transition-transform transform hover:scale-105 flex items-center justify-center space-x-1 text-xs sm:text-sm"
									onClick={() => onDelete(product.id)}
								>
									<span>🗑️</span>
									<span className="hidden sm:inline">Remove</span>
								</button>
							)}
						</td>
					</tr>
				))
			)}
		</tbody>
	</table>
);

export default Table;
