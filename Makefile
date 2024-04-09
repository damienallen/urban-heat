.PHONY: app service

app:
	cd app; yarn dev

service:
	uvicorn service.urban_heat.main:app --reload