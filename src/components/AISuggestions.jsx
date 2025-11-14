import React, { useState } from 'react';
import { sendUserIdToN8N, fetchMessages } from '../api/productApi';
import Button from './Button';

const AISuggestions = () => {
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleAISuggestions = async () => {
		setLoading(true);
		setError('');
		try {
			const userId = localStorage.getItem('userId');
			await sendUserIdToN8N(userId);
			// Delete messages first
			await fetch('http://localhost:9092/api/messages', { method: 'DELETE' });
			// Wait for 30 seconds
			await new Promise(resolve => setTimeout(resolve, 30000));
			// Fetch messages after delay
			const result = await fetchMessages();
			setMessages(result);
		} catch (err) {
			setError('Failed to fetch AI suggestions.');
		}
		setLoading(false);
	};

	return (
		<section className="bg-gradient-to-r from-amber-50 to-yellow-50 p-3 sm:p-6 rounded-lg shadow-md border border-amber-200">
			<div className="flex items-center mb-2 sm:mb-3">
				<span className="text-xl sm:text-2xl mr-2">🧠</span>
				<h3 className="font-bold text-amber-700 text-lg sm:text-xl">Chef's Recommendations</h3>
			</div>
			<p className="text-amber-800 mb-3 italic border-l-2 border-amber-300 pl-3 text-sm sm:text-base">Get creative recipes using your nearly expired ingredients!</p>
			<Button
				variant="primary"
				size="medium"
				className="w-full sm:w-auto"
				onClick={handleAISuggestions}
				disabled={loading}
			>
				{loading ? '👨‍🍳 Cooking up ideas...' : '🍳 Get Recipe Ideas'}
			</Button>
			{error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
			{messages.length > 0 && (
		<div
			className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white rounded-lg shadow-inner border border-amber-100 text-amber-900 text-sm sm:text-base"
			dangerouslySetInnerHTML={{
			__html: (() => {
				let raw = messages[0].message;

				// If message is a JSON string, parse it
				try {
				const parsed = JSON.parse(raw);
				if (parsed.message) {
					raw = parsed.message;
				}
				} catch (e) {
				// not JSON, just continue
				}

				return raw
				.replace(/\n/g, "<br/>")                // line breaks
				.replace(/\*\*(.*?)\*\*/g, "<b class='text-amber-700'>$1</b>") // **bold** with color
				.replace(/### (.*?)(<br\/>|$)/g, "<h3 class='text-lg font-bold text-amber-600 mt-2 mb-1'>$1</h3>") // headings with color
				.replace(/- (.*?)(<br\/>|$)/g, "<div class='flex items-start mb-1'><span class='mr-2 text-amber-500'>•</span><span>$1</span></div>"); // bullet points
			})()
			}}
		/>
		)}

		</section>
	);
};

export default AISuggestions;
