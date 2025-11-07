"use client";
import { useState, FormEvent } from 'react';
import { Facebook, Twitter, Instagram } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageStatus, setMessageStatus] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setMessageStatus({ text: 'Please fill in all fields.', type: 'error' });
      return;
    }

    if (!isValidEmail(formData.email)) {
      setMessageStatus({ text: 'Please enter a valid email address.', type: 'error' });
      return;
    }

    if (formData.name.length < 2) {
      setMessageStatus({ text: 'Name must be at least 2 characters.', type: 'error' });
      return;
    }

    if (formData.message.length < 10) {
      setMessageStatus({ text: 'Message must be at least 10 characters.', type: 'error' });
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessageStatus({ text: 'Thank you! Your message has been sent successfully.', type: 'success' });
        setFormData({ name: '', email: '', message: '' });
      } else {
        setMessageStatus({ text: data.message || 'Something went wrong. Please try again.', type: 'error' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessageStatus({ text: 'Unable to send message. Please try again later.', type: 'error' });
    } finally {
      setIsSubmitting(false);
      
      // Auto-hide message after 5 seconds
      setTimeout(() => {
        setMessageStatus(null);
      }, 5000);
    }
  };

  const isValidEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <main className="mt-[140px] px-[50px] py-[60px] pb-[80px] min-h-[calc(100vh-140px)] md:px-[30px] md:mt-[100px] md:py-[40px] md:pb-[60px] sm:px-5 sm:mt-[100px] sm:py-[40px] sm:pb-[60px]">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-[80px] items-start md:gap-[50px]">
        {/* Left Section - Contact Information */}
        <div className="pt-[40px]">
          <h1 className="font-[family-name:var(--font-headers)] text-[48px] font-normal text-black mb-[30px] leading-[1.2] md:text-4xl sm:text-[28px]">
            Contact Us
          </h1>
          <p className="font-[family-name:var(--font-body)] text-base text-[#666] mb-2.5 leading-[1.6]">
            Great vision without great people is irrelevant.
          </p>
          <p className="font-[family-name:var(--font-body)] text-sm text-[#999] mb-[40px]">
            Let's work together.
          </p>
          
          <div className="mt-[50px]">
            <h3 className="font-[family-name:var(--font-nav)] text-sm tracking-wider uppercase text-black mb-[15px]">
              Our mailing address is:
            </h3>
            <address className="font-[family-name:var(--font-body)] text-sm leading-[1.8] text-[#666] not-italic mb-5">
              152A Charlotte Street,<br />
              Peterborough ON<br />
            </address>
            
            <p className="font-[family-name:var(--font-body)] text-sm text-black mb-[30px]">
              <strong className="font-semibold">Phone:</strong> 705-742-3221
            </p>
            
            {/* Social Media Links */}
            <div className="flex gap-5 mt-[30px] sm:gap-[15px]">
              <a 
                href="https://facebook.com" 
                className="w-10 h-10 flex items-center justify-center border border-black rounded-full text-black text-lg no-underline transition-all duration-300 hover:bg-black hover:text-white sm:w-9 sm:h-9 sm:text-base"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                className="w-10 h-10 flex items-center justify-center border border-black rounded-full text-black text-lg no-underline transition-all duration-300 hover:bg-black hover:text-white sm:w-9 sm:h-9 sm:text-base"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com" 
                className="w-10 h-10 flex items-center justify-center border border-black rounded-full text-black text-lg no-underline transition-all duration-300 hover:bg-black hover:text-white sm:w-9 sm:h-9 sm:text-base"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://tiktok.com" 
                className="w-10 h-10 flex items-center justify-center border border-black rounded-full text-black text-lg no-underline transition-all duration-300 hover:bg-black hover:text-white sm:w-9 sm:h-9 sm:text-base"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        {/* Right Section - Contact Form */}
        <div className="bg-[rgba(248,248,248,0.8)] p-[50px_60px] rounded-lg backdrop-blur-[10px] md:p-[40px_30px] sm:p-[30px_25px]">
          <p className="font-[family-name:var(--font-accent)] text-lg text-black mb-2 tracking-[0.5px]">
            Great vision without great people is irrelevant.
          </p>
          <p className="font-[family-name:var(--font-body)] text-[13px] text-[#999] mb-[30px]">
            Let's work together.
          </p>
          
          {/* Success/Error Message */}
          {messageStatus && (
            <div 
              className={`p-[15px_20px] rounded mb-5 font-[family-name:var(--font-body)] text-sm ${
                messageStatus.type === 'success' 
                  ? 'bg-[#d4edda] text-[#155724] border border-[#c3e6cb]' 
                  : 'bg-[#f8d7da] text-[#721c24] border border-[#f5c6cb]'
              }`}
            >
              {messageStatus.text}
            </div>
          )}
          
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <input 
                type="text" 
                name="name" 
                value={formData.name}
                onChange={handleChange}
                className="w-full p-[15px_20px] border border-[#ddd] rounded font-[family-name:var(--font-body)] text-sm text-black bg-white transition-all duration-300 outline-none focus:border-black focus:shadow-[0_0_0_2px_rgba(0,0,0,0.1)] placeholder:text-[#999]" 
                placeholder="Enter your Name" 
                required
                minLength={2}
              />
            </div>
            
            <div className="flex flex-col">
              <input 
                type="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange}
                className="w-full p-[15px_20px] border border-[#ddd] rounded font-[family-name:var(--font-body)] text-sm text-black bg-white transition-all duration-300 outline-none focus:border-black focus:shadow-[0_0_0_2px_rgba(0,0,0,0.1)] placeholder:text-[#999]" 
                placeholder="Enter a valid email address" 
                required
              />
            </div>
            
            <div className="flex flex-col">
              <textarea 
                name="message" 
                value={formData.message}
                onChange={handleChange}
                className="w-full p-[15px_20px] border border-[#ddd] rounded font-[family-name:var(--font-body)] text-sm text-black bg-white transition-all duration-300 outline-none focus:border-black focus:shadow-[0_0_0_2px_rgba(0,0,0,0.1)] placeholder:text-[#999] min-h-[150px] resize-y" 
                placeholder="Enter your message" 
                required
                minLength={10}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-[180px] p-[15px_30px] bg-[#d9d9d9] border-none rounded font-[family-name:var(--font-nav)] text-sm font-semibold tracking-[2px] uppercase text-black cursor-pointer transition-all duration-300 hover:bg-[#bbb] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed sm:w-full"
            >
              {isSubmitting ? 'SENDING...' : 'SUBMIT'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
