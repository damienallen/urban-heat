.PHONY: app service

app:
	cd app; yarn dev

service:
	uvicorn urban_heat.main:app --reload