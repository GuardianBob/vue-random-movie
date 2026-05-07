// services/plexService.js
import axios from 'axios';

class PlexService {
  constructor() {
    this.client = null;
    this.plexToken = '';
    this.hostname = '';
    this.port = 32400;
    this.useSsl = false;
    this.machineId = '';
    // Legacy properties for backwards compatibility
    this.baseUrl = '';
    this.token = '';
  }

  /**
   * Configure Plex connection using axios (browser-compatible)
   * @param {Object} options - Configuration options
   * @param {string} options.hostname - Plex server hostname or IP
   * @param {number} [options.port=32400] - Plex server port
   * @param {boolean} [options.useSsl=false] - Use HTTPS (self-signed certs NOT supported)
   * @param {string} [options.machineId] - Plex server machine identifier
   * @param {string} options.plexToken - Plex authentication token
   */
  setCredentials(options) {
    const { hostname, port = 32400, useSsl = false, machineId, plexToken } = options;

    this.hostname = hostname;
    this.port = port;
    this.useSsl = useSsl;
    this.machineId = machineId || '';
    this.plexToken = plexToken;

    const protocol = useSsl ? 'https' : 'http';
    this.baseUrl = `${protocol}://${hostname}:${port}`;
    this.token = plexToken;

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'X-Plex-Token': plexToken,
        'Accept': 'application/json'
      }
    });
  }

  /**
   * Legacy method for backwards compatibility
   * @deprecated Use setCredentials({ hostname, port, useSsl, machineId, plexToken }) instead
   */
  setCredentialsLegacy(baseUrl, token) {
    const url = new URL(baseUrl);
    this.setCredentials({
      hostname: url.hostname,
      port: parseInt(url.port) || 32400,
      useSsl: url.protocol === 'https:',
      plexToken: token
    });
  }

  async getLibraries() {
    if (!this.client) {
      throw new Error('Plex not configured. Call setCredentials() first.');
    }
    try {
      const response = await this.client.get('/library/sections');
      return response.data.MediaContainer.Directory || [];
    } catch (error) {
      console.error('Error fetching Plex libraries:', error.message);
      if (error.message.includes('certificate') || error.message.includes('SSL')) {
        throw new Error('Self-signed SSL certificates are NOT supported. Use HTTP or valid SSL.');
      }
      throw error;
    }
  }

  async getLibraryContents(sectionId, params = {}) {
    if (!this.client) {
      throw new Error('Plex not configured. Call setCredentials() first.');
    }
    try {
      const response = await this.client.get(`/library/sections/${sectionId}/all`, { params });
      return response.data.MediaContainer.Metadata || [];
    } catch (error) {
      console.error('Error fetching library contents:', error.message);
      if (error.message.includes('certificate') || error.message.includes('SSL')) {
        throw new Error('Self-signed SSL certificates are NOT supported. Use HTTP or valid SSL.');
      }
      throw error;
    }
  }

  /**
   * Get media metadata for a specific item
   * @param {string} key - The media key (e.g., /library/metadata/12345)
   */
  async getMediaMetadata(key) {
    if (!this.client) {
      throw new Error('Plex not configured. Call setCredentials() first.');
    }
    try {
      const response = await this.client.get(key);
      return response.data.MediaContainer.Metadata?.[0] || null;
    } catch (error) {
      console.error('Error fetching media metadata:', error.message);
      throw error;
    }
  }

  /**
   * Get recently added items from Plex library
   * @param {number} [limit] - Limit number of results
   */
  async getRecentlyAdded(limit = 50) {
    if (!this.client) {
      throw new Error('Plex not configured. Call setCredentials() first.');
    }
    try {
      const response = await this.client.get('/library/recentlyAdded', { params: { size: limit } });
      return response.data.MediaContainer.Metadata || [];
    } catch (error) {
      console.error('Error fetching recently added:', error.message);
      throw error;
    }
  }

  async fetchRandom(selections) {
    try {
      selections = {
        type: 'Movie',
        ...selections
      };

      const libraries = await this.getLibraries();

      let relevantLibraries;

      if (selections.libraries && selections.libraries.length > 0) {
        relevantLibraries = libraries.filter(lib =>
          selections.libraries.includes(lib.key)
        );
      } else {
        relevantLibraries = libraries.filter(lib =>
          lib.type === 'movie' || lib.type === 'show'
        );
      }

      if (relevantLibraries.length === 0) {
        throw new Error('No matching libraries found');
      }

      let allItems = [];
      for (const lib of relevantLibraries) {
        const items = await this.getLibraryContents(lib.key);
        allItems = allItems.concat(items);
      }

      const filteredItems = this.applyFilters(allItems, selections);

      if (filteredItems.length === 0) {
        return [];
      }

      const numToSelect = Math.min(20, filteredItems.length);
      const selectedItems = [];
      const usedIndices = new Set();

      while (selectedItems.length < numToSelect) {
        const randomIndex = Math.floor(Math.random() * filteredItems.length);
        if (!usedIndices.has(randomIndex)) {
          usedIndices.add(randomIndex);
          selectedItems.push(filteredItems[randomIndex]);
        }
      }

      return selectedItems;
    } catch (error) {
      console.error('Error in fetchRandom:', error);
      throw error;
    }
  }

  applyFilters(items, selections) {
    return items.filter(item => {
      // Year filter
      if (selections.start_year && item.year) {
        if (parseInt(item.year) < parseInt(selections.start_year)) return false;
      }
      if (selections.end_year && item.year) {
        if (parseInt(item.year) > parseInt(selections.end_year)) return false;
      }

      // Rating filter (Plex uses userRating or audienceRating)
      if (selections.rating) {
        const rating = item.userRating || item.audienceRating || item.rating;
        if (rating && parseFloat(rating) < parseFloat(selections.rating)) return false;
      }

      // Genre filter
      if (selections.genres && selections.genres.length > 0) {
        if (!item.Genre || !item.Genre.some(genre =>
          selections.genres.includes(genre.tag)
        )) return false;
      }

      // Country filter (if available)
      if (selections.country && item.Country) {
        if (!item.Country.some(country =>
          country.tag.toLowerCase().includes(selections.country.toLowerCase())
        )) return false;
      }

      return true;
    });
  }

  // Test connection to Plex server
  async testConnection() {
    if (!this.client) {
      return { success: false, error: 'Plex not configured. Call setCredentials() first.' };
    }
    try {
      const response = await this.client.get('/');
      const result = response.data;
      const success = result?.MediaContainer?.size !== undefined;
      return {
        success,
        serverTitle: result.MediaContainer?.title || 'Unknown',
        version: result.MediaContainer?.version || 'Unknown'
      };
    } catch (error) {
      let errorMessage = error.message || 'Unknown error';

      if (errorMessage.includes('certificate') || errorMessage.includes('SSL')) {
        errorMessage = 'Self-signed SSL certificates are NOT supported. Use HTTP or valid SSL.';
      } else if (errorMessage.includes('ECONNREFUSED')) {
        errorMessage = 'Connection refused - check hostname and port';
      } else if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('getaddrinfo')) {
        errorMessage = 'Server not found - check hostname';
      } else if (error.response?.status === 401 || errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        errorMessage = 'Authentication failed - check Plex token';
      }

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Check if Plex token is valid by pinging MyPlex
   * Token refresh mechanism per Overseerr v1.34.0+
   */
  async validateToken() {
    if (!this.plexToken) {
      return { valid: false, error: 'No Plex token configured' };
    }
    try {
      const response = await this.client.get('/');
      const result = response.data;
      const valid = result?.MediaContainer?.size !== undefined;
      return { valid, error: valid ? null : 'Invalid token response' };
    } catch (error) {
      return {
        valid: false,
        error: error.response?.status === 401 || error.message?.includes('401') || error.message?.includes('Unauthorized')
          ? 'Token expired or invalid'
          : error.message
      };
    }
  }

  /**
   * Get current configuration (for debugging/display)
   */
  getConfig() {
    return {
      hostname: this.hostname,
      port: this.port,
      useSsl: this.useSsl,
      machineId: this.machineId,
      isConfigured: !!this.client
    };
  }
}

export default new PlexService();
