import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: "'Nunito', sans-serif",
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😕</div>
          <h2 style={{ fontFamily: "'Fredoka', cursive", marginBottom: '0.5rem' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#6B6560', marginBottom: '1.5rem' }}>
            Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#8B9A46',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
