import { getSupabaseAdminClient } from '../config/supabase';
import { PortfolioData, MediaItem, ProjectItem, SkillItem, ServiceItem, ExperienceItem, SectionConfig } from '../../src/types/portfolio';
import { VersionHistoryItem, AuditLogEntry, AdminUser, AdminSession } from '../../src/types/backend';

export interface DatabaseUser extends AdminUser {
  passwordHash?: string;
  passwordSalt?: string;
}

export class SupabaseRepository {
  private getClient() {
    const client = getSupabaseAdminClient();
    if (!client) {
      throw new Error('Supabase client is not available. Please verify SUPABASE_URL and SUPABASE_SECRET_KEY.');
    }
    return client;
  }

  // ==========================================
  // 1. PUBLISHED PORTFOLIO
  // ==========================================

  public async getPublished(): Promise<PortfolioData | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from('published_versions')
      .select('data')
      .eq('id', 'current_published')
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST205' || error.code === '42P01') {
        console.warn('[SupabaseRepository] Table "published_versions" not yet created in Supabase. Using local portfolio data.');
      } else {
        console.error('[SupabaseRepository] Error getting published portfolio:', error.message);
      }
      return null;
    }

    return (data?.data as PortfolioData) || null;
  }

  public async savePublished(data: PortfolioData, authorId: string = 'admin'): Promise<void> {
    const supabase = this.getClient();

    // 1. Upsert Published Version record
    const { error: pubError } = await supabase
      .from('published_versions')
      .upsert({
        id: 'current_published',
        data: data,
        published_by: authorId,
        version: data.version || 1,
        published_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (pubError) {
      if (pubError.code === 'PGRST205' || pubError.code === '42P01') {
        console.warn('[SupabaseRepository] Table "published_versions" not yet created in Supabase. Stored safely in local persistent storage.');
        return;
      }
      console.error('[SupabaseRepository] Error saving published_versions:', pubError.message);
      throw new Error(`Failed to save published portfolio in Supabase: ${pubError.message}`);
    }

    // 2. Also keep draft synchronized
    await this.saveDraft(data, authorId);

    // 3. Normalized tables sync
    try {
      await this.syncNormalizedTables(data);
    } catch (normErr) {
      console.warn('[SupabaseRepository] Warning: Normalized tables sync partial error:', normErr);
    }

    // 4. Create Version History record
    try {
      const versionId = `ver_${Date.now()}`;
      const versionRecord: VersionHistoryItem = {
        id: versionId,
        versionNumber: data.version || 1,
        versionLabel: `Production Publication v${data.version || 1}`,
        author: {
          id: authorId,
          name: 'Administrator',
          email: 'admin@muhammadakram.dev'
        },
        timestamp: new Date().toISOString(),
        summary: `Production release v${data.version || 1}`,
        stats: {
          sectionsCount: data.sections?.length || 0,
          projectsCount: data.projects?.length || 0,
          skillsCount: data.skills?.length || 0,
          servicesCount: data.services?.length || 0,
          mediaCount: data.media?.length || 0
        },
        snapshot: data
      };
      await this.addVersion(versionRecord);
    } catch (vErr) {
      console.warn('[SupabaseRepository] Warning: Could not create version snapshot:', vErr);
    }
  }

  // ==========================================
  // 2. DRAFT PORTFOLIO
  // ==========================================

  public async getDraft(): Promise<PortfolioData | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from('drafts')
      .select('data')
      .eq('id', 'current_draft')
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST205' || error.code === '42P01') {
        console.warn('[SupabaseRepository] Table "drafts" not yet created in Supabase. Using local portfolio draft.');
      } else {
        console.error('[SupabaseRepository] Error getting draft portfolio:', error.message);
      }
      return null;
    }

    return (data?.data as PortfolioData) || null;
  }

  public async saveDraft(data: PortfolioData, authorId: string = 'admin'): Promise<void> {
    const supabase = this.getClient();
    const { error } = await supabase
      .from('drafts')
      .upsert({
        id: 'current_draft',
        data: data,
        last_saved_by: authorId,
        version: data.version || 1,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      if (error.code === 'PGRST205' || error.code === '42P01') {
        console.warn('[SupabaseRepository] Table "drafts" not yet created in Supabase. Stored safely in local persistent storage.');
        return;
      }
      console.error('[SupabaseRepository] Error saving drafts:', error.message);
      throw new Error(`Failed to save draft in Supabase: ${error.message}`);
    }
  }

  // ==========================================
  // 3. VERSION HISTORY
  // ==========================================

  public async getVersions(): Promise<VersionHistoryItem[]> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from('version_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      if (error.code === 'PGRST205' || error.code === '42P01') {
        console.warn('[SupabaseRepository] Table "version_history" not yet created in Supabase. Using local versions history.');
      } else {
        console.error('[SupabaseRepository] Error fetching version_history:', error.message);
      }
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      versionNumber: row.version_number,
      versionLabel: row.label || `Version ${row.version_number}`,
      author: {
        id: row.created_by || 'admin',
        name: row.metadata?.authorName || 'Administrator',
        email: row.metadata?.authorEmail || 'admin@muhammadakram.dev'
      },
      timestamp: row.published_at || row.created_at || new Date().toISOString(),
      summary: row.metadata?.summary || row.label || 'Release snapshot',
      stats: {
        sectionsCount: row.metadata?.sectionsCount || 0,
        projectsCount: row.metadata?.projectsCount || 0,
        skillsCount: row.metadata?.skillsCount || 0,
        servicesCount: row.metadata?.servicesCount || 0,
        mediaCount: row.metadata?.mediaCount || 0
      },
      snapshot: row.data as PortfolioData
    }));
  }

  public async getVersionById(id: string): Promise<VersionHistoryItem | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from('version_history')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      versionNumber: data.version_number,
      versionLabel: data.label || `Version ${data.version_number}`,
      author: {
        id: data.created_by || 'admin',
        name: data.metadata?.authorName || 'Administrator',
        email: data.metadata?.authorEmail || 'admin@muhammadakram.dev'
      },
      timestamp: data.published_at || data.created_at || new Date().toISOString(),
      summary: data.metadata?.summary || data.label || 'Release snapshot',
      stats: {
        sectionsCount: data.metadata?.sectionsCount || 0,
        projectsCount: data.metadata?.projectsCount || 0,
        skillsCount: data.metadata?.skillsCount || 0,
        servicesCount: data.metadata?.servicesCount || 0,
        mediaCount: data.metadata?.mediaCount || 0
      },
      snapshot: data.data as PortfolioData
    };
  }

  public async addVersion(version: VersionHistoryItem): Promise<void> {
    const supabase = this.getClient();
    const { error } = await supabase.from('version_history').upsert({
      id: version.id,
      version_number: version.versionNumber,
      label: version.versionLabel,
      data: version.snapshot,
      created_by: version.author?.id || 'admin',
      created_at: version.timestamp || new Date().toISOString(),
      published_at: version.timestamp || new Date().toISOString(),
      metadata: {
        authorName: version.author?.name,
        authorEmail: version.author?.email,
        summary: version.summary,
        ...version.stats
      }
    }, { onConflict: 'id' });

    if (error) {
      if (error.code === 'PGRST205' || error.code === '42P01') {
        console.warn('[SupabaseRepository] Table "version_history" not yet created in Supabase. Stored safely in local persistent storage.');
        return;
      }
      console.error('[SupabaseRepository] Error adding version:', error.message);
      throw error;
    }
  }

  // ==========================================
  // 4. MEDIA MANAGEMENT
  // ==========================================

  public async getMedia(): Promise<MediaItem[]> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205' || error.code === '42P01') {
        console.warn('[SupabaseRepository] Table "media" not yet created in Supabase. Using local media library.');
      } else {
        console.error('[SupabaseRepository] Error fetching media:', error.message);
      }
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      filename: row.filename,
      originalFilename: row.original_filename,
      name: row.name,
      url: row.url,
      alt: row.alt || '',
      altText: row.alt_text || '',
      caption: row.caption || '',
      description: row.description || '',
      mediaType: row.media_type || 'image',
      mimeType: row.mime_type || '',
      fileSize: row.file_size || '',
      fileSizeBytes: row.file_size_bytes || 0,
      dimensions: row.dimensions || '',
      width: row.width,
      height: row.height,
      usedIn: Array.isArray(row.used_in) ? row.used_in : [],
      source: row.source || 'upload',
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  public async addMediaItem(item: MediaItem): Promise<void> {
    const supabase = this.getClient();
    const { error } = await supabase.from('media').upsert({
      id: item.id,
      filename: item.filename || item.name,
      original_filename: item.originalFilename || item.filename || item.name,
      name: item.name,
      url: item.url,
      storage_path: (item as any).storagePath || null,
      alt: item.alt || '',
      alt_text: item.altText || item.alt || '',
      caption: item.caption || '',
      description: item.description || '',
      media_type: item.mediaType || 'image',
      mime_type: item.mimeType || '',
      file_size: item.fileSize || '',
      file_size_bytes: item.fileSizeBytes || 0,
      dimensions: item.dimensions || '',
      width: item.width || null,
      height: item.height || null,
      used_in: item.usedIn || [],
      source: item.source || 'upload',
      created_at: item.createdAt || new Date().toISOString(),
      updated_at: item.updatedAt || new Date().toISOString()
    }, { onConflict: 'id' });

    if (error) {
      console.error('[SupabaseRepository] Error adding media item:', error.message);
      throw error;
    }
  }

  public async updateMediaItem(id: string, updates: Partial<MediaItem>): Promise<void> {
    const supabase = this.getClient();
    const payload: any = { updated_at: new Date().toISOString() };

    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.alt !== undefined) payload.alt = updates.alt;
    if (updates.altText !== undefined) payload.alt_text = updates.altText;
    if (updates.caption !== undefined) payload.caption = updates.caption;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.usedIn !== undefined) payload.used_in = updates.usedIn;
    if (updates.url !== undefined) payload.url = updates.url;

    const { error } = await supabase.from('media').update(payload).eq('id', id);
    if (error) {
      console.error('[SupabaseRepository] Error updating media item:', error.message);
      throw error;
    }
  }

  public async deleteMediaItem(id: string): Promise<void> {
    const supabase = this.getClient();
    const { error } = await supabase.from('media').delete().eq('id', id);
    if (error) {
      console.error('[SupabaseRepository] Error deleting media item:', error.message);
      throw error;
    }
  }

  // ==========================================
  // 5. AUTHENTICATION & USERS
  // ==========================================

  public async getUserByEmail(email: string): Promise<DatabaseUser | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email.trim())
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      displayName: data.display_name,
      role: data.role as any,
      passwordHash: data.password_hash,
      passwordSalt: data.password_salt,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  public async upsertUser(user: DatabaseUser): Promise<void> {
    const supabase = this.getClient();
    const { error } = await supabase.from('users').upsert({
      email: user.email.toLowerCase(),
      display_name: user.displayName,
      role: user.role,
      password_hash: user.passwordHash,
      password_salt: user.passwordSalt,
      updated_at: new Date().toISOString()
    }, { onConflict: 'email' });

    if (error) {
      console.error('[SupabaseRepository] Error upserting user:', error.message);
      throw error;
    }
  }

  public async createSession(session: AdminSession): Promise<void> {
    const supabase = this.getClient();
    const { error } = await supabase.from('sessions').upsert({
      token: session.token,
      user_id: session.userId,
      user_email: session.user.email,
      user_role: session.user.role,
      created_at: session.createdAt,
      expires_at: session.expiresAt
    }, { onConflict: 'token' });

    if (error) {
      console.warn('[SupabaseRepository] Warning: Could not persist session in Supabase:', error.message);
    }
  }

  public async getSession(token: string): Promise<AdminSession | null> {
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (error || !data) return null;

    // Check expiration
    if (new Date(data.expires_at).getTime() < Date.now()) {
      await this.deleteSession(token);
      return null;
    }

    return {
      id: data.token,
      token: data.token,
      userId: data.user_id,
      user: {
        id: data.user_id,
        email: data.user_email,
        displayName: 'Muhammad Akram',
        role: data.user_role as any,
        createdAt: data.created_at,
        updatedAt: data.created_at
      },
      createdAt: data.created_at,
      expiresAt: data.expires_at
    };
  }

  public async deleteSession(token: string): Promise<void> {
    const supabase = this.getClient();
    await supabase.from('sessions').delete().eq('token', token);
  }

  // ==========================================
  // 6. AUDIT LOGS
  // ==========================================

  public async addAuditLog(entry: AuditLogEntry): Promise<void> {
    try {
      const supabase = this.getClient();
      await supabase.from('audit_logs').insert({
        action: entry.action,
        user_id: entry.userId,
        details: entry.details || {},
        ip_address: entry.ip || null,
        timestamp: entry.timestamp || new Date().toISOString()
      });
    } catch (err) {
      console.warn('[SupabaseRepository] Warning: Could not log audit entry in Supabase:', err);
    }
  }

  // ==========================================
  // 7. NORMALIZED TABLES SYNCHRONIZATION
  // ==========================================

  private async syncNormalizedTables(data: PortfolioData): Promise<void> {
    const supabase = this.getClient();

    // 1. Projects
    if (data.projects && Array.isArray(data.projects)) {
      for (let i = 0; i < data.projects.length; i++) {
        const p: ProjectItem = data.projects[i];
        await supabase.from('projects').upsert({
          id: p.id,
          title: p.title,
          slug: p.id,
          category: p.category,
          short_description: p.shortDescription,
          full_description: p.fullDescription || p.shortDescription,
          image_url: p.imageUrl,
          live_url: p.liveUrl || null,
          github_url: p.githubUrl || null,
          technologies: p.technologies || [],
          is_featured: !!p.isFeatured,
          sort_order: p.order !== undefined ? p.order : i,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

        if (p.galleryImages && Array.isArray(p.galleryImages) && p.galleryImages.length > 0) {
          try {
            await supabase.from('project_gallery').delete().eq('project_id', p.id);
            const rows = p.galleryImages.map((gImg, gIdx) => ({
              project_id: p.id,
              image_url: gImg,
              sort_order: gIdx
            }));
            await supabase.from('project_gallery').insert(rows);
          } catch {
            // Graceful fallback if project_gallery table cache is warming
          }
        }
      }
    }

    // 2. Skills
    if (data.skills && Array.isArray(data.skills)) {
      for (let i = 0; i < data.skills.length; i++) {
        const s: SkillItem = data.skills[i];
        await supabase.from('skills').upsert({
          id: s.id,
          name: s.name,
          category: s.category,
          proficiency: s.proficiencyPercentage || 85,
          icon_name: s.iconName || null,
          is_featured: s.isVisible !== false,
          sort_order: s.order !== undefined ? s.order : i,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      }
    }

    // 3. Services
    if (data.services && Array.isArray(data.services)) {
      for (let i = 0; i < data.services.length; i++) {
        const s: ServiceItem = data.services[i];
        await supabase.from('services').upsert({
          id: s.id,
          title: s.title,
          description: s.description,
          deliverables: s.features || [],
          icon_name: s.iconName || null,
          sort_order: s.order !== undefined ? s.order : i,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      }
    }

    // 4. Experience
    if (data.experience && Array.isArray(data.experience)) {
      for (let i = 0; i < data.experience.length; i++) {
        const exp: ExperienceItem = data.experience[i];
        await supabase.from('experience').upsert({
          id: exp.id,
          role: exp.role,
          company: exp.type || 'Self-Employed / Independent',
          location: exp.location || '',
          period: exp.period,
          description: exp.description,
          achievements: exp.highlights || [],
          sort_order: exp.order !== undefined ? exp.order : i,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      }
    }

    // 5. Sections
    if (data.sections && Array.isArray(data.sections)) {
      for (let i = 0; i < data.sections.length; i++) {
        const sec: SectionConfig = data.sections[i];
        await supabase.from('sections').upsert({
          id: sec.id,
          name: sec.type,
          type: sec.type,
          is_visible: sec.isVisible !== false,
          sort_order: sec.order !== undefined ? sec.order : i,
          custom_title: sec.customTitle || null,
          custom_subtitle: sec.customSubtitle || null,
          styles: sec.style || {},
          elements: sec.elements || [],
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      }
    }
  }
}
