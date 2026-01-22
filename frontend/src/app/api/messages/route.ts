import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/**
 * API Route for cross-browser encrypted message storage
 * Uses Supabase for persistent, globally accessible storage
 * Falls back to in-memory storage for local dev (cross-browser within same session)
 */

interface EncryptedMessage {
  submissionId: string;
  documentHash: string;
  encryptedContent: string;
  iv: string;
  recipientAddress: string;
  timestamp: number;
}

// In-memory storage for local dev (persists during server session)
// This enables cross-browser testing without Supabase
const memoryStore: Map<string, EncryptedMessage> = new Map();

// POST - Store a new encrypted message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionId, documentHash, encryptedContent, iv, recipientAddress } = body;

    if (!submissionId || !encryptedContent || !iv || !recipientAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const message: EncryptedMessage = {
      submissionId,
      documentHash: documentHash || '',
      encryptedContent,
      iv,
      recipientAddress,
      timestamp: Date.now(),
    };

    // Use Supabase for persistent storage
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from('encrypted_messages')
        .upsert({
          submission_id: submissionId,
          document_hash: documentHash || '',
          encrypted_content: encryptedContent,
          iv: iv,
          recipient_address: recipientAddress,
          created_at: new Date().toISOString(),
        }, {
          onConflict: 'submission_id'
        });

      if (error) {
        console.error('[API] Supabase error:', error);
        return NextResponse.json(
          { error: 'Failed to store message: ' + error.message },
          { status: 500 }
        );
      }

      console.log('[API] Stored encrypted message in Supabase:', submissionId);
      return NextResponse.json({
        success: true,
        submissionId,
        timestamp: message.timestamp,
        storage: 'supabase'
      });
    }

    // No Supabase configured - use in-memory storage for local dev
    console.log('[API] Using in-memory storage (no Supabase):', submissionId);
    memoryStore.set(submissionId, message);
    if (documentHash) {
      memoryStore.set(documentHash, message);
    }
    console.log('[API] Memory store now has', memoryStore.size, 'entries');

    return NextResponse.json({
      success: true,
      submissionId,
      timestamp: message.timestamp,
      storage: 'memory'
    });
  } catch (error) {
    console.error('[API] Error storing message:', error);
    return NextResponse.json(
      { error: 'Failed to store message' },
      { status: 500 }
    );
  }
}

// GET - Retrieve an encrypted message by ID or list all for a recipient
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const recipientAddress = searchParams.get('recipient');
    const listAll = searchParams.get('list') === 'true';

    // If list=true and recipient provided, return ALL messages for that recipient
    if (listAll && recipientAddress) {
      console.log('[API] Listing all messages for recipient:', recipientAddress);

      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('encrypted_messages')
          .select('*')
          .eq('recipient_address', recipientAddress)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[API] Supabase error:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const messages = (data || []).map((d: any) => ({
          submissionId: d.submission_id,
          documentHash: d.document_hash,
          encryptedContent: d.encrypted_content,
          iv: d.iv,
          recipientAddress: d.recipient_address,
          timestamp: new Date(d.created_at).getTime(),
        }));

        return NextResponse.json({ messages, count: messages.length });
      }

      // In-memory fallback - filter by recipient
      const messages: EncryptedMessage[] = [];
      memoryStore.forEach((msg, key) => {
        if (msg.recipientAddress === recipientAddress && !key.includes('field.private')) {
          messages.push(msg);
        }
      });

      // Dedupe by submissionId
      const uniqueMessages = Array.from(
        new Map(messages.map(m => [m.submissionId, m])).values()
      );

      console.log('[API] Found', uniqueMessages.length, 'messages for recipient in memory');
      return NextResponse.json({ messages: uniqueMessages, count: uniqueMessages.length, storage: 'memory' });
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Missing id parameter' },
        { status: 400 }
      );
    }

    console.log('[API] Looking up message for:', id);

    // Use Supabase for persistent storage
    if (isSupabaseConfigured() && supabase) {
      // Try to find by submission_id first, then by document_hash
      let { data, error } = await supabase
        .from('encrypted_messages')
        .select('*')
        .eq('submission_id', id)
        .single();

      // If not found by submission_id, try document_hash
      if (!data && !error?.message?.includes('multiple')) {
        const result = await supabase
          .from('encrypted_messages')
          .select('*')
          .eq('document_hash', id)
          .single();
        data = result.data;
        error = result.error;
      }

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('[API] Supabase error:', error);
        return NextResponse.json(
          { error: 'Database error: ' + error.message },
          { status: 500 }
        );
      }

      if (!data) {
        console.log('[API] Message not found in Supabase for:', id);
        return NextResponse.json(
          { error: 'Message not found', found: false },
          { status: 404 }
        );
      }

      // Optionally verify recipient
      if (recipientAddress && data.recipient_address !== recipientAddress) {
        console.log('[API] Recipient mismatch');
        return NextResponse.json(
          { error: 'Message not intended for this recipient' },
          { status: 403 }
        );
      }

      console.log('[API] Found message in Supabase for:', id);
      return NextResponse.json({
        found: true,
        message: {
          submissionId: data.submission_id,
          documentHash: data.document_hash,
          encryptedContent: data.encrypted_content,
          iv: data.iv,
          recipientAddress: data.recipient_address,
          timestamp: new Date(data.created_at).getTime(),
        }
      });
    }

    // No Supabase configured - use in-memory storage
    console.log('[API] Using in-memory storage to look up:', id);
    const message = memoryStore.get(id);

    if (!message) {
      console.log('[API] Message not found in memory store. Available keys:', Array.from(memoryStore.keys()));
      return NextResponse.json(
        { error: 'Message not found', found: false },
        { status: 404 }
      );
    }

    // Optionally verify recipient
    if (recipientAddress && message.recipientAddress !== recipientAddress) {
      console.log('[API] Recipient mismatch');
      return NextResponse.json(
        { error: 'Message not intended for this recipient' },
        { status: 403 }
      );
    }

    console.log('[API] Found message in memory store for:', id);
    return NextResponse.json({
      found: true,
      message,
      storage: 'memory'
    });
  } catch (error) {
    console.error('[API] Error retrieving message:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve message' },
      { status: 500 }
    );
  }
}
