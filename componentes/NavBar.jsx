// /componentes/NavBar.js  (ESTA É A VERSÃO CORRIGIDA)
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { useAuth } from '../contexts/authContext'; 
import Toast from 'react-native-toast-message';
import logo from '../assets/logoHidroCascavel.png';

// Aceita as props de rolagem E a nova prop 'isDashboard'
const NavBar = ({
  onScrollToApresentacao,
  onScrollToEducacao,
  onScrollToContato,
  onScrollToServicos,
  isDashboard, // <-- Nova prop
}) => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const { user, userData } = useAuth(); 
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null); 

  const isMobile = width <= 800;

  // Função pública (sempre igual)
  const handlePressPublico = (scrollFunction) => {
    setMenuOpen(false);
    if (scrollFunction) {
      scrollFunction(); 
    } else {
      navigation.navigate("TelaInicial"); 
    }
  };

  // === INÍCIO DAS MUDANÇAS ===

  // ✅ CORREÇÃO 2: Lógica do botão "Home" (casinha)
  const handleHomePress = () => {
    setMenuOpen(false);
    
    // Se 'isDashboard' for true (estamos na HomeAdm), vai para a TelaInicial
    if (isDashboard) {
      navigation.navigate("TelaInicial");
      return; // Para a execução
    }
    
    // Senão (estamos na TelaInicial), vai para o dashboard correto
    if (userData?.tipoUsuario === 'administrador') {
      navigation.navigate("AdministradorStack"); 
    } else if (userData?.tipoUsuario === 'analista') {
      navigation.navigate("AnalistaStack"); 
    } else if (userData?.tipoUsuario === 'proprietario') {
      navigation.navigate("ProprietarioStack");
    }
  };
  
  // ✅ CORREÇÃO 1: Navegação aninhada para "Notificações"
  const handleNotificacoesPress = () => {
    setMenuOpen(false);
    const tipo = userData?.tipoUsuario;
    
    console.log('🔔 Navegando para Notificações...');
    
    if (tipo === 'administrador') {
      // Sintaxe: navigation.navigate("StackPai", { screen: "TelaFilha" })
      navigation.navigate("AdministradorStack", { screen: "NotificacoesAdm" }); 
    } else if (tipo === 'analista') {
      navigation.navigate("AnalistaStack", { screen: "NotificacoesAnalista" }); 
    } else if (tipo === 'proprietario') {
      navigation.navigate("ProprietarioStack", { screen: "NotificacoesProprietario" });
    }
  };

  // ✅ CORREÇÃO 1: Navegação aninhada para "Perfil"
  const handlePerfilPress = () => {
    setMenuOpen(false);
    const tipo = userData?.tipoUsuario;
    
    console.log('👤 Navegando para Perfil...');

    // Assumindo que a tela se chama "PerfilUsuario" em todos os stacks
    if (tipo === 'administrador') {
      navigation.navigate("AdministradorStack", { screen: "PerfilUsuario" });
    } else if (tipo === 'analista') {
      navigation.navigate("AnalistaStack", { screen: "PerfilUsuario" });
    } else if (tipo === 'proprietario') {
      navigation.navigate("ProprietarioStack", { screen: "PerfilUsuario" });
    }
  };

  // === FIM DAS MUDANÇAS ===

  const handleDeslogar = async () => {
    // ... (código original, está correto)
    try {
      await signOut(auth);
      Toast.show({ type: 'success', text1: 'Logout realizado' });
      navigation.navigate("TelaInicial");
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Erro ao fazer logout' });
    }
  };
  
  const handleLoginPress = () => {
    setMenuOpen(false);
    navigation.navigate("Login");
  };

  // Componentes internos (Tooltip, IconButton)
  const Tooltip = ({ text, visible }) => {
    if (!visible) return null;
    return (
      <View style={styles.tooltip}>
        <Text style={styles.tooltipText}>{text}</Text>
      </View>
    );
  };
  const IconButton = ({ icon, label, onPress, buttonStyle }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
      <View style={styles.iconButtonContainer}>
        <TouchableOpacity
          style={[ styles.iconButton, buttonStyle, isHovered && styles.iconButtonHovered ]}
          onPress={onPress}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <MaterialIcons name={icon} size={24} color="#fff" />
        </TouchableOpacity>
        <Tooltip text={label} visible={isHovered} />
      </View>
    );
  };

  // === ESTILOS CONDICIONAIS (sem mudanças) ===
  const navBarStyle = user ? styles.navBarLogado : styles.navBarDeslogado;
  const navTextStyle = user ? styles.navTextLogado : styles.navTextDeslogado;
  const iconColor = user ? "#fff" : "#2685BF";
  const sideMenuColor = user ? styles.sideMenuLogado : styles.sideMenuDeslogado;


  return (
    // O JSX (visual) não muda, apenas as funções que ele chama
    <View style={[styles.navBar, navBarStyle, isMobile ? styles.mobileNav : styles.desktopNav]}>
      {isMobile ? (
        // ======================
        // === MODO MOBILE ===
        // ======================
        <>
          <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)}>
            <MaterialIcons name="menu" size={30} color={iconColor} />
          </TouchableOpacity>

          {menuOpen && (
            <View style={[styles.sideMenu, sideMenuColor]}>
              {/* Links Públicos */}
              <TouchableOpacity style={styles.navItem} onPress={() => handlePressPublico(onScrollToApresentacao)}>
                <Text style={navTextStyle}>Sobre</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navItem} onPress={() => handlePressPublico(onScrollToServicos)}>
                <Text style={navTextStyle}>Serviços</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navItem} onPress={() => handlePressPublico(onScrollToEducacao)}>
                <Text style={navTextStyle}>Educação Ambiental</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navItem} onPress={() => handlePressPublico(onScrollToContato)}>
                <Text style={navTextStyle}>Contato</Text>
              </TouchableOpacity>

              {/* Botões Condicionais */}
              {user ? (
                // --- Se ESTIVER LOGADO (Mobile) ---
                <View style={styles.mobileIconButtons}>
                  <TouchableOpacity style={[styles.mobileIconButton, styles.homeButton]} onPress={handleHomePress}>
                    <MaterialIcons name="home" size={20} color="#fff" />
                    <Text style={styles.mobileIconText}>Home</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.mobileIconButton, styles.notificacoesButton]} onPress={handleNotificacoesPress}>
                    <MaterialIcons name="notifications" size={20} color="#fff" />
                    <Text style={styles.mobileIconText}>Notificações</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.mobileIconButton, styles.perfilButton]} onPress={handlePerfilPress}>
                    <MaterialIcons name="person" size={20} color="#fff" />
                    <Text style={styles.mobileIconText}>Perfil</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.mobileIconButton, styles.logoutButton]} onPress={handleDeslogar}>
                    <MaterialIcons name="logout" size={20} color="#fff" />
                    <Text style={styles.mobileIconText}>Sair</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                // --- Se ESTIVER DESLOGADO (Mobile) ---
                <TouchableOpacity style={[styles.navItem, styles.loginButton]} onPress={handleLoginPress}>
                  <MaterialIcons name="login" size={20} color="#2685BF" />
                  <Text style={styles.loginText}>Entrar</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </>
      ) : (
        // ======================
        // === MODO DESKTOP ===
        // ======================
        <View style={styles.navRow}>
          <Image source={logo} style={styles.logo} /> 

          <View style={styles.navItemsContainer}>
            <TouchableOpacity style={styles.navItem} onPress={() => handlePressPublico(onScrollToApresentacao)}>
              <Text style={navTextStyle}>Sobre</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => handlePressPublico(onScrollToServicos)}>
              <Text style={navTextStyle}>Serviços</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => handlePressPublico(onScrollToEducacao)}>
              <Text style={navTextStyle}>Educação Ambiental</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => handlePressPublico(onScrollToContato)}>
              <Text style={navTextStyle}>Contato</Text>
            </TouchableOpacity>
          </View>

          {/* Botões Condicionais */}
          <View style={styles.rightButtons}>
            {user ? (
              // --- Se ESTIVER LOGADO (Desktop) ---
              <>
                <IconButton icon="home" label="Home" onPress={handleHomePress} buttonStyle={styles.homeButton} />
                <IconButton icon="notifications" label="Notificações" onPress={handleNotificacoesPress} buttonStyle={styles.notificacoesButton} />
                <IconButton icon="person" label="Perfil" onPress={handlePerfilPress} buttonStyle={styles.perfilButton} />
                <IconButton icon="logout" label="Sair" onPress={handleDeslogar} buttonStyle={styles.logoutButton} />
              </>
            ) : (
              // --- Se ESTIVER DESLOGADO (Desktop) ---
              <TouchableOpacity style={[styles.navItem, styles.loginButton]} onPress={handleLoginPress}>
                <MaterialIcons name="login" size={20} color="#2685BF" />
                <Text style={styles.loginText}>Entrar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default NavBar;

// === ESTILOS UNIFICADOS (sem mudanças) ===
const styles = StyleSheet.create({
  navBar: {
    marginTop: 20,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    position: "absolute",
    top: 0,
    width: "95%",
    zIndex: 1000,
    alignSelf: "center",
    borderRadius: 10,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  // Estilo DESLOGADO (Fundo Branco)
  navBarDeslogado: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  navTextDeslogado: {
    fontSize: 16,
    color: "#333",
  },
  sideMenuDeslogado: {
    backgroundColor: "#fff",
  },
  
  // Estilo LOGADO (Fundo Azul)
  navBarLogado: {
    backgroundColor: "#2685BF",
  },
  navTextLogado: {
    fontSize: 16,
    color: "#fff",
  },
  sideMenuLogado: {
    backgroundColor: "#3D9DD9", // Cor do menu mobile logado
  },

  // === Layout ===
  logo: { width: 80, height: 80 },
  mobileNav: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    alignItems: 'center',
    height: 90, // Altura base
  },
  desktopNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-between',
    width: '100%',
  },
  navItemsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  rightButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sideMenu: {
    position: "absolute",
    top: 90, // Abaixo do NavBar
    left: 0,
    width: "70%",
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    zIndex: 1001,
    borderRadius: 8,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    marginVertical: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  
  // === Botões Deslogado ===
  loginButton: {
    // (estilo do nav deslogado)
  },
  loginText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: "bold",
    color: "#2685BF",
  },

  // === Botões Logado (Desktop) ===
  iconButtonContainer: { position: 'relative' },
  iconButton: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  iconButtonHovered: { transform: [{ scale: 1.1 }] },
  tooltip: {
    position: 'absolute', top: 50, left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: '#333',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 4, zIndex: 1002,
  },
  tooltipText: {
    color: '#fff', fontSize: 12, fontWeight: '500',
  },
  
  // === Botões Logado (Mobile) ===
  mobileIconButtons: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1a6fa3', // Cor do nav logado
    paddingTop: 10,
  },
  mobileIconButton: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: 4, paddingVertical: 8,
    paddingHorizontal: 12, borderRadius: 6,
  },
  mobileIconText: {
    marginLeft: 8, fontSize: 14,
    fontWeight: "bold", color: "#fff", // Cor do nav logado
  },
  
  // === Cores Botões Logado ===
  homeButton: { backgroundColor: "#008000" },
  notificacoesButton: { backgroundColor: "#FF9800" },
  perfilButton: { backgroundColor: "#1a6fa3" },
  logoutButton: { backgroundColor: "#d32f2f" },
});