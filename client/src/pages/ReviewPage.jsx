import React, { useState } from 'react';
import './css/ReviewPage.css';

const ReviewPage = () => {
  const [currentStage, setCurrentStage] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    isAnonymous: false,
    rating: 5, // Default to middle value
    comments: '',
    email: '',
    skipEmail: false
  });

  const totalStages = 3;

  // Rating tooltips mapping
  const ratingTooltips = {
    1: "Terrible",
    2: "Very Poor", 
    3: "Poor",
    4: "Below Average",
    5: "Average",
    6: "Above Average",
    7: "Good",
    8: "Very Good",
    9: "Excellent",
    10: "Outstanding"
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStage < totalStages) {
      setCurrentStage(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStage > 1) {
      setCurrentStage(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Here you would typically send the data to your backend
      console.log('Submitting review:', formData);
      
      // For now, just show an alert
      alert('Thank you for your review! We appreciate your feedback.');
      
      // Reset form
      setFormData({
        name: '',
        isAnonymous: false,
        rating: 5,
        comments: '',
        email: '',
        skipEmail: false
      });
      setCurrentStage(1);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('There was an error submitting your review. Please try again.');
    }
  };

  const canProceedStage1 = formData.isAnonymous || formData.name.trim();
  const canProceedStage2 = formData.rating && formData.comments.trim();
  const canSubmit = formData.skipEmail || formData.email.trim();

  const renderProgressBar = () => {
    return (
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(currentStage / totalStages) * 100}%` }}
          ></div>
        </div>
        <div className="progress-labels">
          <span className={currentStage >= 1 ? 'active' : ''}>Name</span>
          <span className={currentStage >= 2 ? 'active' : ''}>Review</span>
          <span className={currentStage >= 3 ? 'active' : ''}>Contact</span>
        </div>
      </div>
    );
  };

  const renderStage1 = () => {
    return (
      <div className="review-stage">
        <h2>Tell us your name</h2>
        <p>We'd like to know who's sharing their feedback with us.</p>
        
        <div className="form-group">
          <label htmlFor="name">Your Name</label>
          <input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={formData.isAnonymous}
            className={formData.isAnonymous ? 'disabled' : ''}
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.isAnonymous}
              onChange={(e) => {
                handleInputChange('isAnonymous', e.target.checked);
                if (e.target.checked) {
                  handleInputChange('name', '');
                }
              }}
            />
            <span className="checkbox-text">I prefer to remain anonymous</span>
          </label>
        </div>

        <div className="button-group">
          <button 
            className="btn btn-primary"
            onClick={handleNext}
            disabled={!canProceedStage1}
          >
            Continue
          </button>
        </div>
      </div>
    );
  };

  const renderStage2 = () => {
    return (
      <div className="review-stage">
        <h2>Rate your experience</h2>
        <p>How would you rate our site overall?</p>
        
        <div className="form-group">
          <label>Rating (1-10)</label>
          <div className="rating-container">
            <div className="rating-display">
              <div className="rating-value">{formData.rating}</div>
              <div className={`rating-tooltip ${formData.rating ? 'show' : ''}`}>
                {ratingTooltips[formData.rating]}
              </div>
            </div>
            
            <div className="rating-slider-container">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.rating}
                onChange={(e) => handleInputChange('rating', parseInt(e.target.value))}
                className="rating-slider"
              />
              <div className="rating-labels">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
                <span>7</span>
                <span>8</span>
                <span>9</span>
                <span>10</span>
              </div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="comments">Your Comments</label>
          <textarea
            id="comments"
            placeholder="Tell us about your experience..."
            value={formData.comments}
            onChange={(e) => handleInputChange('comments', e.target.value)}
            rows="4"
          ></textarea>
        </div>

        <div className="button-group">
          <button 
            className="btn btn-secondary"
            onClick={handleBack}
          >
            Back
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleNext}
            disabled={!canProceedStage2}
          >
            Continue
          </button>
        </div>
      </div>
    );
  };

  const renderStage3 = () => {
    return (
      <div className="review-stage">
        <h2>Get a response</h2>
        <p>Would you like us to follow up on your review?</p>
        
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={formData.skipEmail}
            className={formData.skipEmail ? 'disabled' : ''}
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.skipEmail}
              onChange={(e) => {
                handleInputChange('skipEmail', e.target.checked);
                if (e.target.checked) {
                  handleInputChange('email', '');
                }
              }}
            />
            <span className="checkbox-text">I don't want to be contacted</span>
          </label>
        </div>

        <div className="review-summary">
          <h3>Review Summary</h3>
          <div className="summary-item">
            <strong>Name:</strong>
            <span>{formData.isAnonymous ? 'Anonymous' : formData.name || 'Not provided'}</span>
          </div>
          <div className="summary-item">
            <strong>Rating:</strong>
            <span>{formData.rating}/10 - {ratingTooltips[formData.rating]}</span>
          </div>
          <div className="summary-item">
            <strong>Comments:</strong>
            <span>{formData.comments}</span>
          </div>
          <div className="summary-item">
            <strong>Email:</strong>
            <span>{formData.skipEmail ? 'Not provided' : formData.email || 'Not provided'}</span>
          </div>
        </div>

        <div className="button-group">
          <button 
            className="btn btn-secondary"
            onClick={handleBack}
          >
            Back
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Submit Review
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="review-page">
      <h2 className="review-title">
        <span className="review-icon">📝</span>
        Give Us Feedback!
      </h2>
      <div className="review-container">
        {renderProgressBar()}
        
        <div className="review-content">
          {currentStage === 1 && renderStage1()}
          {currentStage === 2 && renderStage2()}
          {currentStage === 3 && renderStage3()}
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;