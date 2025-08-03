import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { RouteProp, useRoute } from '@react-navigation/native';

// Type definitions
type MaintenanceAction = {
  action: string;
  performedAt: Date;
  notes: string;
};

type DroneMaintenance = {
  _id?: string;
  droneId: string;
  scheduledDate: string; // ISO string
  description: string;
  userComments?: string;
  issueType?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  isResolved: boolean;
  actionsTaken?: MaintenanceAction[];
};

type ParamList = {
  ResolveMaintenance: {
    maintenance: string;
  };
};

export default function ResolveMaintenanceScreen() {
  const route = useRoute<RouteProp<ParamList, 'ResolveMaintenance'>>();
  const maintenance = React.useMemo<DroneMaintenance | null>(() => {
    try {
      return JSON.parse(route.params.maintenance) as DroneMaintenance;
    } catch {
      return null;
    }
  }, [route.params.maintenance]);
  
  if (!maintenance) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Maintenance data not available.</Text>
      </View>
    );
  }
  
  // Local form state
  const [formData, setFormData] = useState({
    issueType: maintenance.issueType || '',
    issue: '',
    bodyPartName: '',
    bodyPart: '',
    actionsTaken: maintenance.actionsTaken || [] as MaintenanceAction[],
    technicianComments: '',
    status: maintenance.status,
    isResolved: maintenance.isResolved,
    images: {} as Record<string, any>,
  });

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString();
  };

  const handleActionAdd = (): void => {
    const newAction: MaintenanceAction = {
      action: `Action ${formData.actionsTaken.length + 1}`,
      performedAt: new Date(),
      notes: ''
    };
    setFormData(prev => ({
      ...prev,
      actionsTaken: [...prev.actionsTaken, newAction]
    }));
  };

  const handleActionUpdate = (
    index: number,
    field: keyof MaintenanceAction,
    value: string
  ): void => {
    setFormData(prev => {
      const updated = [...prev.actionsTaken];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, actionsTaken: updated };
    });
  };

  const handleSubmit = (): void => {
    // TODO: Submit logic
    console.log('Submitting report', {
      maintenanceId: maintenance._id,
      ...formData
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Drone #{maintenance.droneId}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scheduled Details</Text>
        <Text style={styles.detailText}>Scheduled for: {formatDate(maintenance.scheduledDate)}</Text>
        <Text style={styles.detailText}>Reason: {maintenance.description}</Text>
        <Text style={styles.detailText}>Comments: {maintenance.userComments || 'None'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Maintenance Details</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Issue Type</Text>
          <Picker
            selectedValue={formData.issueType}
            onValueChange={itemValue => setFormData(prev => ({ ...prev, issueType: itemValue }))}
            style={styles.picker}
          >
            <Picker.Item label="Select issue type" value="" />
            <Picker.Item label="Hardware" value="HARDWARE" />
            <Picker.Item label="Software" value="SOFTWARE" />
            <Picker.Item label="Other" value="OTHER" />
          </Picker>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Issue Description</Text>
          <TextInput
            style={styles.input}
            value={formData.issue}
            onChangeText={text => setFormData(prev => ({ ...prev, issue: text }))}
            placeholder="Describe the issue"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Body Part Name</Text>
          <TextInput
            style={styles.input}
            value={formData.bodyPartName}
            onChangeText={text => setFormData(prev => ({ ...prev, bodyPartName: text }))}
            placeholder="Enter body part name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Select Body Part</Text>
          <Picker
            selectedValue={formData.bodyPart}
            onValueChange={itemValue => setFormData(prev => ({ ...prev, bodyPart: itemValue }))}
            style={styles.picker}
          >
            <Picker.Item label="Select body part" value="" />
            <Picker.Item label="Propellers" value="PROPELLERS" />
            <Picker.Item label="Battery" value="BATTERY" />
            <Picker.Item label="Camera" value="CAMERA" />
            <Picker.Item label="Sensors" value="SENSORS" />
          </Picker>
        </View>

        {/* <View style={styles.formGroup}>
          <Text style={styles.label}>Add Image</Text>
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Upload Image</Text>
          </TouchableOpacity>
        </View> */}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions Taken</Text>
        {formData.actionsTaken.map((action, idx) => (
          <View key={idx} style={styles.actionItem}>
            <TextInput
              style={[styles.input, { marginBottom: 5 }]}
              value={action.action}
              onChangeText={text => handleActionUpdate(idx, 'action', text)}
              placeholder="Action description"
            />
            <TextInput
              style={styles.input}
              value={action.notes}
              onChangeText={text => handleActionUpdate(idx, 'notes', text)}
              placeholder="Notes"
              multiline
            />
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={handleActionAdd}>
          <Text style={styles.addButtonText}>+ Add Action</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Technician Comments</Text>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
          value={formData.technicianComments}
          onChangeText={text => setFormData(prev => ({ ...prev, technicianComments: text }))}
          placeholder="Enter comments"
          multiline
        />
      </View>

      <View style={styles.section}>
<Text style={styles.sectionTitle}>Status</Text>

        <Picker
          selectedValue={formData.status}
          onValueChange={itemValue => setFormData(prev => ({ ...prev, status: itemValue }))}
          style={styles.picker}
        >
          <Picker.Item label="Pending" value="PENDING" />
          <Picker.Item label="In Progress" value="IN_PROGRESS" />
          <Picker.Item label="Completed" value="COMPLETED" />
          <Picker.Item label="Cancelled" value="CANCELLED" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
  header: { marginBottom: 20 },
  headerText: { fontSize: 20, fontWeight: 'light', color: '#333' },
  section: { backgroundColor: 'white', borderRadius: 8, padding: 15, marginBottom: 15, },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5 },
  detailText: { fontSize: 14, color: '#555', marginBottom: 5 },
  formGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 5, color: '#555' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 4, padding: 10, fontSize: 14, backgroundColor: '#fff' },
  picker: { borderWidth: 1, borderColor: '#ddd', borderRadius: 4, backgroundColor: '#fff', marginBottom: 10 },
  uploadButton: { borderWidth: 1, borderColor: '#ddd', borderRadius: 4, padding: 15, alignItems: 'center', backgroundColor: '#f9f9f9' },
  uploadButtonText: { color: '#555' },
  addButton: { backgroundColor: '#e9e9e9', padding: 10, borderRadius: 4, alignItems: 'center', marginTop: 10 },
  addButtonText: { color: '#333', fontWeight: '500' },
  actionItem: { marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  submitButton: { backgroundColor: '#FF671F', padding: 15, borderRadius: 4, alignItems: 'center', marginBottom: 20 },
  submitButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: 'red' }
});
