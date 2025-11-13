// componentes/CalendarioVisitas.js - VERSÃO CORRIGIDA
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator 
} from 'react-native';
import { useVisits } from '../hooks/useVisits';

const CalendarioVisitas = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [visitsByDate, setVisitsByDate] = useState({});
  const { visits, loading } = useVisits();

  // Nomes dos meses em português
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Dias da semana
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // ✅ FUNÇÃO CORRIGIDA: Organizar visitas por data
  useEffect(() => {
    const organizedVisits = {};
    
    visits.forEach(visit => {
      if (visit.dataVisita) {
        try {
          // Converter string de data para Date de forma segura
          let visitDate;
          
          if (typeof visit.dataVisita === 'string') {
            visitDate = new Date(visit.dataVisita);
          } else if (visit.dataVisita && typeof visit.dataVisita.toDate === 'function') {
            // Se for um Timestamp do Firebase
            visitDate = visit.dataVisita.toDate();
          } else if (visit.dataVisita instanceof Date) {
            visitDate = visit.dataVisita;
          } else {
            console.warn('Formato de data não reconhecido:', visit.dataVisita);
            return; // Pula esta visita se a data for inválida
          }

          // Verificar se a data é válida
          if (isNaN(visitDate.getTime())) {
            console.warn('Data inválida:', visit.dataVisita);
            return;
          }

          // ✅ CORREÇÃO: Usar toLocaleDateString em vez de toISOString
          const dateKey = visitDate.toLocaleDateString('en-CA'); // Formato YYYY-MM-DD
          
          if (!organizedVisits[dateKey]) {
            organizedVisits[dateKey] = {
              concluded: 0,
              scheduled: 0,
              visits: []
            };
          }
          
          organizedVisits[dateKey].visits.push(visit);
          
          // Contar visitas concluídas e agendadas baseado na situação
          if (visit.situacao === 'concluida') {
            organizedVisits[dateKey].concluded++;
          } else {
            organizedVisits[dateKey].scheduled++;
          }
        } catch (error) {
          console.error('Erro ao processar visita:', error, visit);
        }
      }
    });
    
    setVisitsByDate(organizedVisits);
  }, [visits]);

  // ✅ FUNÇÃO CORRIGIDA: Gerar o calendário do mês atual
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1);
    // Último dia do mês
    const lastDay = new Date(year, month + 1, 0);
    // Dia da semana do primeiro dia (0 = Domingo, 1 = Segunda, etc.)
    const firstDayOfWeek = firstDay.getDay();
    // Número de dias no mês
    const daysInMonth = lastDay.getDate();
    
    const weeks = [];
    let day = 1;
    
    for (let i = 0; i < 6; i++) {
      const week = [];
      
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < firstDayOfWeek) || day > daysInMonth) {
          // Dias vazios antes do primeiro dia ou após o último dia
          week.push(null);
        } else {
          const date = new Date(year, month, day);
          week.push({ day, date });
          day++;
        }
      }
      
      weeks.push(week);
      if (day > daysInMonth) break;
    }
    
    return weeks;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const isToday = (dayObj) => {
    if (!dayObj) return false;
    const today = new Date();
    return (
      dayObj.date.getMonth() === today.getMonth() &&
      dayObj.date.getFullYear() === today.getFullYear() &&
      dayObj.day === today.getDate()
    );
  };

  const isSelected = (dayObj) => {
    return (
      dayObj &&
      selectedDate &&
      dayObj.date.getMonth() === selectedDate.getMonth() &&
      dayObj.date.getFullYear() === selectedDate.getFullYear() &&
      dayObj.day === selectedDate.getDate()
    );
  };

  // ✅ FUNÇÃO CORRIGIDA: Verificar se tem visitas
  const hasVisits = (dayObj) => {
    if (!dayObj) return false;
    try {
      const dateKey = dayObj.date.toLocaleDateString('en-CA');
      return visitsByDate[dateKey] && 
             (visitsByDate[dateKey].scheduled > 0 || visitsByDate[dateKey].concluded > 0);
    } catch (error) {
      console.error('Erro ao verificar visitas:', error);
      return false;
    }
  };

  // ✅ FUNÇÃO CORRIGIDA: Obter informações de visitas
  const getVisitInfo = (dayObj) => {
    if (!dayObj) return null;
    try {
      const dateKey = dayObj.date.toLocaleDateString('en-CA');
      return visitsByDate[dateKey];
    } catch (error) {
      console.error('Erro ao obter informações de visitas:', error);
      return null;
    }
  };

  const handleDayPress = (dayObj) => {
    if (dayObj) {
      setSelectedDate(new Date(dayObj.date));
    }
  };

  // ✅ FUNÇÃO CORRIGIDA: Obter visitas para data selecionada
  const getVisitsForSelectedDate = () => {
    if (!selectedDate) return [];
    try {
      const dateKey = selectedDate.toLocaleDateString('en-CA');
      return visitsByDate[dateKey]?.visits || [];
    } catch (error) {
      console.error('Erro ao obter visitas para data:', error);
      return [];
    }
  };

  // Formatar data para exibição
  const formatDate = (dateString) => {
    if (!dateString) return '--/--/---- --:--';
    
    try {
      let date;
      if (typeof dateString === 'string') {
        date = new Date(dateString);
      } else if (dateString && typeof dateString.toDate === 'function') {
        date = dateString.toDate();
      } else if (dateString instanceof Date) {
        date = dateString;
      } else {
        return 'Data inválida';
      }

      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }

      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Erro na data';
    }
  };

  // Obter status da visita para exibição
  const getStatusInfo = (visit) => {
    if (visit.situacao === 'concluida') {
      return { text: 'Concluída', color: '#4CAF50' };
    } else if (visit.status === 'aprovada') {
      return { text: 'Aprovada', color: '#2196F3' };
    } else {
      return { text: 'Agendada', color: '#FF9800' };
    }
  };

  const calendarWeeks = generateCalendar();
  const selectedDateVisits = getVisitsForSelectedDate();

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5E60CE" />
          <Text style={styles.loadingText}>Carregando visitas...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Cabeçalho com navegação */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
          <Text style={styles.navText}>‹</Text>
        </TouchableOpacity>
        
        <Text style={styles.monthText}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        
        <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
          <Text style={styles.navText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Legenda */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Concluídas</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
          <Text style={styles.legendText}>Agendadas</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#2196F3' }]} />
          <Text style={styles.legendText}>Aprovadas</Text>
        </View>
      </View>

      {/* Dias da semana */}
      <View style={styles.weekDays}>
        {weekDays.map((day, index) => (
          <Text key={index} style={styles.weekDayText}>
            {day}
          </Text>
        ))}
      </View>

      {/* Dias do mês */}
      <ScrollView style={styles.calendarContainer}>
        {calendarWeeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.week}>
            {week.map((dayObj, dayIndex) => (
              <TouchableOpacity
                key={dayIndex}
                style={[
                  styles.day,
                  isToday(dayObj) && styles.today,
                  isSelected(dayObj) && styles.selectedDay,
                  hasVisits(dayObj) && styles.hasVisitsDay
                ]}
                onPress={() => handleDayPress(dayObj)}
                disabled={!dayObj}
              >
                <Text
                  style={[
                    styles.dayText,
                    !dayObj && styles.emptyDay,
                    isToday(dayObj) && styles.todayText,
                    isSelected(dayObj) && styles.selectedDayText
                  ]}
                >
                  {dayObj ? dayObj.day : ''}
                </Text>
                
                {/* Indicadores de visitas */}
                {dayObj && hasVisits(dayObj) && (
                  <View style={styles.visitIndicators}>
                    <View style={styles.indicatorsRow}>
                      {/* Concluídas */}
                      {getVisitInfo(dayObj)?.concluded > 0 && (
                        <View style={[styles.indicator, styles.concludedIndicator]} />
                      )}
                      {/* Agendadas/Aprovadas */}
                      {getVisitInfo(dayObj)?.scheduled > 0 && (
                        <View style={[styles.indicator, styles.scheduledIndicator]} />
                      )}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Detalhes das visitas da data selecionada */}
      {selectedDate && (
        <View style={styles.visitsDetails}>
          <Text style={styles.visitsTitle}>
            Visitas para {selectedDate.toLocaleDateString('pt-BR')}
          </Text>
          
          {selectedDateVisits.length === 0 ? (
            <Text style={styles.noVisitsText}>Nenhuma visita para esta data</Text>
          ) : (
            <ScrollView style={styles.visitsList}>
              {selectedDateVisits.map((visit) => {
                const statusInfo = getStatusInfo(visit);
                return (
                  <View key={visit.id} style={styles.visitItem}>
                    <Text style={styles.visitWell}>Poço: {visit.pocoNome || 'N/A'}</Text>
                    <Text style={styles.visitProprietario}>
                      Proprietário: {visit.proprietario || 'N/A'}
                    </Text>
                    <Text style={styles.visitAnalista}>
                      Analista: {visit.analistaNome || 'N/A'}
                    </Text>
                    <Text style={[styles.visitStatus, { color: statusInfo.color }]}>
                      Status: {statusInfo.text}
                    </Text>
                    <Text style={styles.visitTime}>
                      Horário: {formatDate(visit.dataVisita).split(' ')[1]}
                    </Text>
                    {visit.observacoes && (
                      <Text style={styles.visitObservacoes}>
                        Observações: {visit.observacoes}
                      </Text>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  navText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5E60CE',
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  weekDayText: {
    fontWeight: 'bold',
    color: '#666',
    width: 40,
    textAlign: 'center',
  },
  calendarContainer: {
    flex: 1,
    maxHeight: 300,
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  day: {
    width: 40,
    height: 50,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 8,
    margin: 2,
    paddingTop: 4,
  },
  dayText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  emptyDay: {
    color: 'transparent',
  },
  today: {
    backgroundColor: '#5E60CE20',
    borderWidth: 1,
    borderColor: '#5E60CE',
  },
  todayText: {
    color: '#5E60CE',
    fontWeight: 'bold',
  },
  selectedDay: {
    backgroundColor: '#5E60CE40',
    borderWidth: 2,
    borderColor: '#5E60CE',
  },
  selectedDayText: {
    color: '#5E60CE',
    fontWeight: 'bold',
  },
  hasVisitsDay: {
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  visitIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  concludedIndicator: {
    backgroundColor: '#4CAF50',
  },
  scheduledIndicator: {
    backgroundColor: '#FF9800',
  },
  visitsDetails: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    maxHeight: 200,
  },
  visitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  noVisitsText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  visitsList: {
    flex: 1,
  },
  visitItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#5E60CE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  visitWell: {
    fontWeight: '600',
    color: '#333',
    fontSize: 14,
  },
  visitProprietario: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  visitAnalista: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  visitStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  visitTime: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  visitObservacoes: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default CalendarioVisitas;