// services/geocodingService.js
export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    // Adicionar headers e delay para evitar bloqueio
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    // Fazer a requisição com headers apropriados
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=pt-BR,pt`,
      {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'pt-BR,pt',
          'User-Agent': 'HidroCascavelApp/1.0 (https://github.com/seu-usuario/hidrocascavel)',
          'Referer': 'https://hidrocascavel.com.br'
        }
      }
    );
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 403 || response.status === 429) {
        throw new Error('Limite de requisições excedido. Tente novamente em alguns instantes.');
      }
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.address) {
      const address = data.address;
      
      // Para zonas rurais
      let rua = address.road || '';
      let numero = address.house_number || '';
      let bairro = address.suburb || address.village || address.hamlet || '';
      let cidade = address.city || address.town || address.village || '';
      let estado = address.state || '';
      let cep = address.postcode || '';
      
      // Para áreas rurais
      if (!rua && address.hamlet) {
        rua = `Localidade: ${address.hamlet}`;
      }
      
      if (!cidade && address.municipality) {
        cidade = address.municipality;
      }
      
      if (!cidade && address.county) {
        cidade = address.county;
      }
      
      const enderecoCompleto = [
        rua,
        numero ? `Nº ${numero}` : '',
        bairro,
        cidade,
        estado
      ].filter(Boolean).join(', ');
      
      return {
        rua,
        numero,
        bairro,
        cidade,
        estado,
        cep,
        enderecoCompleto: enderecoCompleto || data.display_name || 'Localização rural'
      };
    }
    
    throw new Error('Endereço não encontrado');
  } catch (error) {
    console.error('Erro no geocoding:', error);
    
    // Fallback para coordenadas
    return {
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      enderecoCompleto: `Localização rural (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`
    };
  }
};

// Função com retry automático
export const getAddressFromCoordinatesWithRetry = async (latitude, longitude, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      // Adicionar delay entre tentativas
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * i));
      }
      
      return await getAddressFromCoordinates(latitude, longitude);
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`Tentativa ${i + 1} falhou, tentando novamente...`);
    }
  }
};