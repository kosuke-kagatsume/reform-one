export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Reform One Platform</h1>
      <p style={{ marginBottom: '2rem', color: '#666' }}>リフォーム産業新聞社 統合プラットフォーム</p>
      
      <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>統合ID</h2>
          <p style={{ color: '#666' }}>電子版・建材トレンド・公式ストア・研修を単一ログインで統合</p>
        </div>
        
        <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>課金管理</h2>
          <p style={{ color: '#666' }}>プレミアプラン（10万/20万円/年）の法人契約管理</p>
        </div>
        
        <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>セキュリティ</h2>
          <p style={{ color: '#666' }}>MFA対応、ドメイン制限、監査ログによる安全な運用</p>
        </div>
      </div>
      
      <div>
        <a 
          href="/login" 
          style={{ 
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2563eb',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px'
          }}
        >
          ログイン
        </a>
      </div>
    </div>
  )
}