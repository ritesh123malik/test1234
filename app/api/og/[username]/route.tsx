import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    // In a real edge function, we'd fetch the user data here
    // For the prototype, we'll use placeholder data or query params
    const { searchParams } = new URL(req.url);
    const score = searchParams.get('score') || '1420';
    const name = searchParams.get('name') || username;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#07070e',
            backgroundImage: 'radial-gradient(circle at 25% 25%, #6c63ff 0%, transparent 50%), radial-gradient(circle at 75% 75%, #ff6584 0%, transparent 50%)',
            color: '#e8e8f4',
            fontFamily: 'sans-serif',
            padding: '40px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
            <div style={{ padding: '12px', background: '#6c63ff', borderRadius: '12px' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '48px', fontWeight: 'bold' }}>PlacementIntel</span>
              <span style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6b6b85' }}>Candidate Dossier</span>
            </div>
          </div>

          {/* Main Card */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(23, 23, 38, 0.8)',
              border: '1px solid rgba(108, 99, 255, 0.3)',
              borderRadius: '32px',
              padding: '60px',
              alignItems: 'center',
              gap: '60px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <div style={{ 
                 width: '180px', 
                 height: '180px', 
                 borderRadius: '90px', 
                 border: '8px solid #6c63ff',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 fontSize: '64px',
                 fontWeight: '900'
               }}>
                 {score}
               </div>
               <span style={{ marginTop: '12px', fontSize: '14px', fontWeight: 'bold', color: '#6c63ff', textTransform: 'uppercase' }}>Neural Power</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '56px', fontWeight: 'bold', marginBottom: '8px' }}>{name}</span>
              <span style={{ fontSize: '24px', color: '#6b6b85' }}>Tier 1 Technical Candidate</span>
              
              <div style={{ display: 'flex', gap: '20px', marginTop: '32px' }}>
                 <div style={{ padding: '8px 16px', background: 'rgba(108,99,255,0.1)', borderRadius: '8px', fontSize: '18px', border: '1px solid rgba(108,99,255,0.2)' }}>
                    LeetCode: Top 1.2%
                 </div>
                 <div style={{ padding: '8px 16px', background: 'rgba(255,101,132,0.1)', borderRadius: '8px', fontSize: '18px', border: '1px solid rgba(255,101,132,0.2)' }}>
                    Codeforces: Specialist
                 </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '60px', fontSize: '20px', color: '#6b6b85' }}>
            Verify profile at placementintel.com/u/{username}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
