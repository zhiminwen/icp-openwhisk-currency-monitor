{{/* Set controller service name */}}
{{- define "controller_service_name" -}}
{{ .Values.global.controllerServiceName | default "controller" | quote }}
{{- end -}}

{{/* Set controller statefulset name */}}
{{- define "controller_statefulset_name" -}}
{{ .Values.global.statefulsetName | default "controller" | quote }}
{{- end -}}

{{/* Set controller port */}}
{{- define "controller_port" -}}
{{ .Values.global.controllerPort | default 8080 }}
{{- end -}}

{{/* Set activations table */}}
{{- define "activations_table" -}}
{{ .Values.activationsTable | default "test_activations" | quote }}
{{- end -}}

{{/* Set actions table */}}
{{- define "actions_table" -}}
{{ .Values.actionsTable | default "test_whisks" | quote }}
{{- end -}}

{{/* Set auths table */}}
{{- define "auths_table" -}}
{{ .Values.authsTable | default "test_subjects" | quote }}
{{- end -}}

{{/* Set invoker statefulset name */}}
{{- define "invoker_statefulset_name" -}}
{{ .Values.invokerStatefulsetName | default "invoker" | quote }}
{{- end -}}

{{/* Generate kafka url without port */}}
{{- define "kafka_url_without_port" -}}
{{ .Values.global.kafkaServiceName | default "kafka" }}.{{ .Release.Namespace }}
{{- end -}}


{{/* Set Couchdb user name */}}
{{- define "couchdb_username" -}}
{{ .Values.global.couchdbUserName | default "whisk_admin" | quote }}
{{- end -}}

{{/* Set Couchdb password */}}
{{- define "couchdb_password" -}}
{{ .Values.global.couchdbPassword | default "some_passw0rd" | quote }}
{{- end -}}

{{/* Generate Couchdb url without port */}}
{{- define "couchdb_url_without_port" -}}
{{ .Values.global.couchdbServiceName | default "couchdb" }}.{{ .Release.Namespace }}
{{- end -}}

{{/* Set Couchdb port */}}
{{- define "couchdb_port" -}}
{{ .Values.global.couchdb_port | default 5984 }}
{{- end -}}
