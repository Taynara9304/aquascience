import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const CalendarioRelatorio = ({ 
  currentDate: externalCurrentDate, 
  onDateSelect, 
  showHeader = true,
  selectedDate: externalSelectedDate 
}) => {
  // Use a data externa se for fornecida, caso contrário use o estado interno
  const [internalCurrentDate, setInternalCurrentDate] = useState(new Date());
  const [internalSelectedDate, setInternalSelectedDate] = useState(null);

  const currentDate = externalCurrentDate || internalCurrentDate;
  const selectedDate = externalSelectedDate || internalSelectedDate;

  // Nomes dos meses em português
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Dias da semana
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Gerar o calendário do mês atual
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
          week.push(day);
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
    
    if (externalCurrentDate) {
      // Se estamos usando data externa, o pai deve controlar
      if (onDateSelect) {
        onDateSelect(newDate); // Notifica o pai sobre a mudança de mês
      }
    } else {
      setInternalCurrentDate(newDate);
    }
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear() &&
      day === today.getDate()
    );
  };

  const isSelected = (day) => {
    if (!day) return false;
    
    if (externalSelectedDate) {
      // Se estamos usando data selecionada externa
      return (
        currentDate.getMonth() === externalSelectedDate.getMonth() &&
        currentDate.getFullYear() === externalSelectedDate.getFullYear() &&
        day === externalSelectedDate.getDate()
      );
    } else {
      // Se estamos usando data selecionada interna
      return (
        selectedDate &&
        currentDate.getMonth() === selectedDate.getMonth() &&
        currentDate.getFullYear() === selectedDate.getFullYear() &&
        day === selectedDate.getDate()
      );
    }
  };

  const handleDayPress = (day) => {
    if (day) {
      const newSelectedDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      
      console.log('Data selecionada:', newSelectedDate.toLocaleDateString('pt-BR'));
      
      // Se temos uma função callback, usamos ela
      if (onDateSelect) {
        onDateSelect(newSelectedDate);
      } else {
        // Caso contrário, usamos o estado interno
        setInternalSelectedDate(newSelectedDate);
      }
    }
  };

  const calendarWeeks = generateCalendar();

  return (
    <View style={styles.container}>
      {/* Cabeçalho com navegação - só mostra se showHeader for true */}
      {showHeader && (
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
      )}

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
            {week.map((day, dayIndex) => (
              <TouchableOpacity
                key={dayIndex}
                style={[
                  styles.day,
                  isToday(day) && styles.today,
                  isSelected(day) && styles.selectedDay
                ]}
                onPress={() => handleDayPress(day)}
                disabled={!day}
              >
                <Text
                  style={[
                    styles.dayText,
                    !day && styles.emptyDay,
                    isToday(day) && styles.todayText,
                    isSelected(day) && styles.selectedDayText
                  ]}
                >
                  {day || ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 10,
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
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  day: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    margin: 2,
  },
  dayText: {
    fontSize: 16,
    color: '#333',
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
    backgroundColor: '#5E60CE',
  },
  selectedDayText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CalendarioRelatorio;