import { useState } from 'react';

const ReviewPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-semibold mb-4">📝 Leave a Review</h2>
      {submitted ? (
        <p className="text-green-600 font-semibold">Thank you for your review!</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
          <input
            type="text"
            placeholder="Game Title"
            required
            className="w-full p-2 border rounded"
          />
          <textarea
            placeholder="Your review..."
            required
            className="w-full p-2 border rounded h-32"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Submit Review
          </button>
        </form>
      )}
    </div>
  );
};

export default ReviewPage;
